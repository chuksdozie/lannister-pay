const { transactionsPayload } = require("../payloads");
var client = require("../redis/redis");
var { APIError } = require("../config/error");
const httpStatus = require("http-status");

/**********************************************************
 *  fee configuration function and transaction application
 **********************************************************/
const feesComputation = async (transactionPayload) => {
  try {
    const payload = await transactionsPayload(transactionPayload);
    // ensure payload exists
    if (!payload) {
      throw new APIError({
        status: httpStatus.BAD_REQUEST,
        message: "Please enter an input",
        errors: "No payload has been detected",
      });
    }

    // ensure critical payload info exists
    if (
      !payload.ID ||
      !payload.Amount ||
      !payload.Currency ||
      !payload.Customer ||
      !payload.Customer.ID ||
      !payload.Customer.EmailAddress ||
      !payload.PaymentEntity.ID ||
      !payload.PaymentEntity.Number ||
      !payload.PaymentEntity.Type
    ) {
      throw new APIError({
        status: httpStatus.BAD_REQUEST,
        message: "Please fill in all required fields",
        errors: "Incomplete payload has been detected",
      });
    }

    // check if the currency is NGN
    if (payload.Currency !== "NGN") {
      throw new APIError({
        status: httpStatus.BAD_REQUEST,
        message: `No Fee configuration for ${payload.Currency} transactions`,
        errors: `No Fee configuration for ${payload.Currency} transactions`,
      });
    }

    //initializing critical info from payload
    let transactionId = payload.ID;
    let feeCurrency = payload.Currency;
    let feeLocale;
    let feeEntity = payload.PaymentEntity.Type;
    let bearsFee = payload.Customer.BearsFee;
    let entityProperty = {
      ID: payload.PaymentEntity.ID,
      Issuer: payload.PaymentEntity.Issuer,
      Brand: payload.PaymentEntity.Brand,
      Number: payload.PaymentEntity.Number,
      SixID: payload.PaymentEntity.SixID,
    };
    let feeType;
    let feeValue;

    // set the FEE LOCALE
    if (payload.CurrencyCountry !== payload.PaymentEntity.Country) {
      feeLocale = "INTL";
    } else {
      feeLocale = "LOCL";
    }

    // setting up the sructure
    const byBrand = `${feeEntity}(${entityProperty.Brand})`;
    const byIssuer = `${feeEntity}(${entityProperty.Issuer})`;
    const byNumber = `${feeEntity}(${entityProperty.Number})`;
    const byID = `${feeEntity}(${entityProperty.ID})`;

    // getting the FEE CONFIGURATION
    let compatible = false;
    let test = JSON.parse(await client.get("fees"));
    let possibleFeeConfig = [];

    // extracting possible FEE CONFIGURATION for the transaction
    for (const key in test) {
      let numOfStars = 0;
      const compare = test[key].split(" ");
      if (
        feeCurrency === compare[1] &&
        feeLocale === compare[2] &&
        (byBrand === compare[3] ||
          byIssuer === compare[3] ||
          byNumber === compare[3] ||
          byID === compare[3])
      ) {
        compatible = true;
        possibleFeeConfig.push(test[key], numOfStars);
      } else if (
        (compare[1] !== "*" && feeCurrency !== compare[1]) ||
        (feeLocale !== compare[2] && compare[2] !== "*") ||
        (byBrand !== compare[3] &&
          byIssuer !== compare[3] &&
          byNumber !== compare[3] &&
          byID !== compare[3] &&
          compare[3] !== `${feeEntity}(*)` &&
          compare[3] !== `*(*)`)
      ) {
        compatible = false;
      } else {
        if (
          compare[3].substring(compare[3].length - 2, compare[3].length - 1) ===
          "*"
        ) {
          numOfStars++;
        }
        if (compare[3].substring(0, compare[3].length - 3) === "*") {
          numOfStars++;
        }
        if (compare[2] === `*`) {
          numOfStars++;
        }
        if (compare[1] === `*`) {
          numOfStars++;
        }
        possibleFeeConfig.push(test[key], numOfStars);
      }
    }

    // check if any AVAILABLE FEE CONFIGURATION
    if (!possibleFeeConfig[0]) {
      throw new APIError({
        status: httpStatus.BAD_REQUEST,
        message: `No Fee configuration for ${payload.Currency} transactions`,
        errors: `No Fee configuration for ${payload.Currency} transactions`,
      });
    }

    // EXTRACTING THE FEE CONFIGURATION
    // WITH THE LOWEST NUMBER OF STARS
    let stars = [];
    for (let i = 1; i < possibleFeeConfig.length; i = i + 2) {
      stars.push(possibleFeeConfig[i]);
    }
    let lowestStar = Math.min(...stars);
    let selectedStar = possibleFeeConfig.indexOf(lowestStar);
    let selectedFC = possibleFeeConfig[selectedStar - 1];
    feeType = selectedFC.split(" ")[6];
    feeValue = selectedFC.split(" ")[7];

    // DETECTING THE FEE TYPE TO APPLY
    if (feeType === "FLAT") {
      feeValue = parseFloat(feeValue).toFixed(2);
    } else if (feeType === "FLAT_PERC") {
      feeValue = feeValue.split(":");
      feeValue = (
        parseFloat(feeValue[0]) +
        parseFloat(feeValue[1] / 100) * parseFloat(payload.Amount)
      ).toFixed(2);
    } else {
      feeValue = (
        parseFloat(feeValue / 100) * parseFloat(payload.Amount)
      ).toFixed(2);
      feeValue = parseFloat(feeValue);
    }

    // CALC THE CHARGE AMOUNT
    let chargeAmount;
    if (bearsFee) {
      chargeAmount = parseFloat(payload.Amount) + parseFloat(feeValue);
    } else {
      chargeAmount = parseFloat(payload.Amount);
    }

    // THE RESPONSE STRUCTURE
    const data = {
      AppliedFeeID: selectedFC.split(" ")[0],
      AppliedFeeValue: feeValue,
      ChargeAmount: chargeAmount,
      SettlementAmount: chargeAmount - feeValue,
    };

    // SENDING RESPONSE TO REDIS CACHE
    const newData = JSON.stringify(data);
    client.setEx(JSON.stringify(transactionId), 500, newData);

    return data;
  } catch (error) {
    throw new APIError({
      status: error.status || httpStatus.INTERNAL_SERVER_ERROR,
      errors: error,
      message: error.message || error,
    });
  }
};

module.exports = {
  feesComputation,
};
