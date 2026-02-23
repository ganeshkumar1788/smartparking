const express = require("express");
const Review = require("../models/Review");
const Booking = require("../models/Booking");
const ParkingSpace = require("../models/ParkingSpace");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

// Fetch reviews for a specific parking space
router.get("/space/:spaceId", async (req, res) => {
  try {
    const reviews = await Review.find({ spaceId: req.params.spaceId })
      .populate("userId", "name")
      .sort({ createdAt: -1 });
    res.json({ reviews });
  } catch (error) {
    res.status(500).json({ message: "Error fetching reviews", error: error.message });
  }
});

// Create a new review
router.post("/", protect, authorize("driver"), async (req, res) => {
  const { bookingId, rating, comment } = req.body;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: "Rating must be between 1 and 5 stars" });
  }

  try {
    const booking = await Booking.findOne({ _id: bookingId, userId: req.user._id });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found or not owned by you" });
    }
    if (booking.status !== "completed") {
      return res.status(400).json({ message: "You can only review completed bookings" });
    }

    const existingReview = await Review.findOne({ bookingId });
    if (existingReview) {
      return res.status(400).json({ message: "You have already reviewed this booking" });
    }

    // Create the review
    const review = await Review.create({
      bookingId,
      userId: req.user._id,
      spaceId: booking.spaceId,
      rating: Number(rating),
      comment
    });

    // Mark the booking as reviewed (we need to add this property to the Booking schema later)
    booking.isReviewed = true;
    await booking.save();

    // Update ParkingSpace average rating
    const space = await ParkingSpace.findById(booking.spaceId);
    if (space) {
      // Compute new rolling average
      const newReviewCount = space.reviewCount + 1;
      const newRating = ((space.rating * space.reviewCount) + Number(rating)) / newReviewCount;

      space.rating = parseFloat(newRating.toFixed(1));
      space.reviewCount = newReviewCount;
      await space.save();
    }

    res.status(201).json({ review, message: "Review submitted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error submitting review", error: error.message });
  }
});

module.exports = router;
