const calcParkingBill = ({ entryTime, exitTime, expectedDurationHours = 0, pricePerHour, commissionPercent }) => {
  const ms = Math.max(0, new Date(exitTime).getTime() - new Date(entryTime).getTime());
  const actualHours = ms / (1000 * 60 * 60);

  // Bill for the booked duration even if they leave early.
  // If they overstay, bill them for the actual time spent.
  const billableHours = Math.max(expectedDurationHours, actualHours);

  const roundedHours = Math.max(0.25, Number(billableHours.toFixed(2)));

  const totalAmount = Number((roundedHours * pricePerHour).toFixed(2));
  const commission = Number(((totalAmount * commissionPercent) / 100).toFixed(2));
  const hostEarning = Number((totalAmount - commission).toFixed(2));

  return { durationHours: roundedHours, totalAmount, commission, hostEarning };
};

module.exports = { calcParkingBill };
