// Fees Setup endpoint PAYLOAD
const feesSetupPayload = () => {
  // this is statics data for now
  const data = {
    1: "LNPY1221 NGN * *(*) : APPLY PERC 1.4",
    2: "LNPY1222 NGN INTL CREDIT-CARD(VISA) : APPLY PERC 5.0",
    3: "LNPY1223 NGN LOCL CREDIT-CARD(*) : APPLY FLAT_PERC 50:1.4",
    4: "LNPY1224 NGN * BANK-ACCOUNT(*) : APPLY FLAT 100",
    5: "LNPY1225 NGN * USSD(MTN) : APPLY PERC 0.55",
  };
  return data;
};

module.exports = {
  feesSetupPayload,
};
