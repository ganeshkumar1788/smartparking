# SmartPark Architecture

## High-level
Frontend (Next.js) -> Backend API (Express) -> MongoDB

External integrations:
- Google Maps API (search + map markers)
- Firebase Auth (Google + phone OTP token verification)
- Payment gateway (Razorpay/Stripe)

## Core Domains
- `users`: authentication, roles, account status
- `parking_spaces`: host-listed spaces with pricing/availability
- `bookings`: booking lifecycle, check-in/check-out timestamps
- `payments`: amount, commission, host earnings
- `reviews`: rating aggregation per parking space
- `admin`: moderation, host approvals, analytics

## Booking + Billing
1. Driver books slot
2. QR token issued
3. Entry scan sets `entryTime`, status `active`
4. Exit scan sets `exitTime`, computes:
   - `durationHours`
   - `totalAmount = durationHours * pricePerHour`
   - `commission = totalAmount * platformPercent / 100`
   - `hostEarning = totalAmount - commission`
5. Payment persisted against booking
