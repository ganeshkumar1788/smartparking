const calcParkingBill = ({ entryTime, exitTime, pricePerHour, commissionPercent }) => {
  const ms = Math.max(0, new Date(exitTime).getTime() - new Date(entryTime).getTime());
  const durationHours = ms / (1000 * 60 * 60);
  const roundedHours = Math.max(0.25, Number(durationHours.toFixed(2)));
  const totalAmount = Number((roundedHours * pricePerHour).toFixed(2));
  const commission = Number(((totalAmount * commissionPercent) / 100).toFixed(2));
  const hostEarning = Number((totalAmount - commission).toFixed(2));
  return { durationHours: roundedHours, totalAmount, commission, hostEarning };
};

module.exports = { calcParkingBill };
