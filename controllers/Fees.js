const { feesSetupPayload } = require("../payloads");

const feesSetup = async () => {
  try {
    const payload = await feesSetupPayload();
    console.log(1232, payload);
    return payload;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports = {
  feesSetup,
};
