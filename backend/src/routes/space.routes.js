const express = require("express");
const { body, query, validationResult } = require("express-validator");
const ParkingSpace = require("../models/ParkingSpace");
const Review = require("../models/Review");
const { protect, authorize } = require("../middleware/auth");

const router = express.Router();

router.get(
  "/",
  [
    query("minPrice").optional().isFloat({ min: 0 }),
    query("maxPrice").optional().isFloat({ min: 0 }),
    query("vehicleType").optional().isString(),
    query("minRating").optional().isFloat({ min: 0, max: 5 })
  ],
  async (req, res) => {
    const filters = { isActive: true };
    const { minPrice, maxPrice, vehicleType, minRating } = req.query;
    if (minPrice || maxPrice) {
      filters.pricePerHour = {};
      if (minPrice) filters.pricePerHour.$gte = Number(minPrice);
      if (maxPrice) filters.pricePerHour.$lte = Number(maxPrice);
    }
    if (vehicleType) filters.vehicleType = vehicleType;
    if (minRating) filters.rating = { $gte: Number(minRating) };

    const spaces = await ParkingSpace.find(filters).sort({ createdAt: -1 });
    res.json({ spaces });
  }
);

router.get("/host/my/list", protect, authorize("host"), async (req, res) => {
  const spaces = await ParkingSpace.find({ hostId: req.user._id }).sort({ createdAt: -1 });
  res.json({ spaces });
});

router.get("/:id", async (req, res) => {
  const space = await ParkingSpace.findById(req.params.id).populate("hostId", "name rating");
  if (!space) return res.status(404).json({ message: "Space not found" });
  const reviews = await Review.find({ spaceId: space._id }).sort({ createdAt: -1 }).limit(10);
  res.json({ space, reviews });
});

router.post(
  "/",
  protect,
  authorize("host"),
  [
    body("title").notEmpty(),
    body("address").notEmpty(),
    body("latitude").isFloat(),
    body("longitude").isFloat(),
    body("pricePerHour").isFloat({ min: 0 }),
    body("capacities").isArray().optional() // Make capacities array optional for backward compat
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    if (!req.user.hostVerified) return res.status(403).json({ message: "Host is not verified by admin" });

    // Auto-generate slots based on capacities: E.g. [{type: 'car', count: 2}, {type: 'bike', count: 1}] -> [C1, C2, B1]
    const slots = [];
    const vehicleTypeArr = [];
    if (req.body.capacities && Array.isArray(req.body.capacities)) {
      req.body.capacities.forEach((cap) => {
        const prefix = cap.type === 'car' ? 'C' : cap.type === 'bike' ? 'B' : cap.type === 'ev' ? 'E' : 'T';
        for (let i = 1; i <= cap.count; i++) {
          slots.push({
            slotId: `${prefix}${i}`,
            vehicleType: cap.type,
            isActive: true
          });
        }
        if (!vehicleTypeArr.includes(cap.type)) {
          vehicleTypeArr.push(cap.type);
        }
      });
    }

    const payload = {
      ...req.body,
      hostId: req.user._id,
      slots: slots.length > 0 ? slots : [{ slotId: "A1", vehicleType: req.body.vehicleType?.[0] || 'car', isActive: true }], // Fallback for old clients
      vehicleType: vehicleTypeArr.length > 0 ? vehicleTypeArr : (req.body.vehicleType || ['car'])
    };

    const space = await ParkingSpace.create(payload);
    res.status(201).json({ space });
  }
);

router.put("/:id", protect, authorize("host"), async (req, res) => {
  const space = await ParkingSpace.findOneAndUpdate(
    { _id: req.params.id, hostId: req.user._id },
    req.body,
    { new: true }
  );
  if (!space) return res.status(404).json({ message: "Space not found" });
  res.json({ space });
});

router.delete("/:id", protect, authorize("host"), async (req, res) => {
  const space = await ParkingSpace.findOneAndUpdate(
    { _id: req.params.id, hostId: req.user._id },
    { isActive: false },
    { new: true }
  );
  if (!space) return res.status(404).json({ message: "Space not found" });
  res.json({ message: "Space disabled" });
});

// Route for camera script to update live occupancy
router.put("/:id/live-status", async (req, res) => {
  try {
    const { occupancy } = req.body;
    const space = await ParkingSpace.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          "liveStatus.occupancy": occupancy,
          "liveStatus.lastUpdated": new Date()
        }
      },
      { new: true }
    );
    if (!space) return res.status(404).json({ message: "Space not found" });
    res.json({ message: "Live status updated successfully", space });
  } catch (error) {
    console.error("Error updating live status:", error);
    res.status(500).json({ message: "Server error updating live status" });
  }
});

module.exports = router;
