const PlatformSetting = require("../models/PlatformSetting");

const getCommissionPercent = async () => {
  const setting = await PlatformSetting.findOne({ key: "commissionPercent" });
  if (!setting) return Number(process.env.PLATFORM_COMMISSION_PERCENT || 10);
  return Number(setting.value || 10);
};

module.exports = { getCommissionPercent };
