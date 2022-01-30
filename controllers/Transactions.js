const { transactionsPayload } = require("../payloads");
var client = require("../redis/redis");
var createError = require("http-errors");
var { APIError } = require("../config/error");
const httpStatus = require("http-status");

/**********************************************************
 *  fee configuration function and transaction application
 *********************************************************/
const feesComputation = async (x) => {
  try {
    const payload = await transactionsPayload(x);
    console.log(12, payload);
    if (!payload) {
      throw new APIError({
        status: httpStatus.BAD_REQUEST,
        message: "Please enter an input",
        errors: "No payload has been detected",
      });
    }

    if (
      !payload.ID ||
      !payload.Amount ||
      !payload.Currency ||
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

    let feeId = payload.ID;
    let feeCurrency = payload.Currency;
    let feeLocale;
    let feeEntity = payload.PaymentEntity.Type;
    let entityProperty = {
      ID: payload.PaymentEntity.ID,
      Issuer: payload.PaymentEntity.Issuer,
      Brand: payload.PaymentEntity.Brand,
      Number: payload.PaymentEntity.Number,
      SixID: payload.PaymentEntity.SixID,
    };
    let feeType;
    let feeValue;

    if (payload.CurrencyCountry !== payload.PaymentEntity.Country) {
      feeLocale = "INTL";
    } else {
      feeLocale = "LOCL";
    }

    // console.log(
    //   `${feeCurrency} ${feeLocale} ${feeEntity}(${entityProperty.Brand})`
    // );
    // console.log(
    //   `${feeCurrency} ${feeLocale} ${feeEntity}(${entityProperty.Issuer})`
    // );
    // console.log(
    //   `${feeCurrency} ${feeLocale} ${feeEntity}(${entityProperty.Number})`
    // );
    const byBrand = `${feeEntity}(${entityProperty.Brand})`;
    const byIssuer = `${feeEntity}(${entityProperty.Issuer})`;
    const byNumber = `${feeEntity}(${entityProperty.Number})`;
    const byID = `${feeEntity}(${entityProperty.ID})`;

    let compatible = false;
    // let numOfStars = 0;

    let test = JSON.parse(await client.get("fees"));
    console.log(111, test);
    // let test = {
    //   data: {
    //     1: "LNPY1221 NGN * *(*) : APPLY PERC 1.4",
    //     2: "LNPY1222 NGN INTL CREDIT-CARD(VISA) : APPLY PERC 5.0",
    //     3: "LNPY1223 NGN LOCL CREDIT-CARD(*) : APPLY FLAT_PERC 50:1.4",
    //     4: "LNPY1224 NGN * BANK-ACCOUNT(*) : APPLY FLAT 100",
    //     5: "LNPY1225 NGN * USSD(MTN) : APPLY PERC 0.55",
    //   },
    // };
    let possible = [];
    for (const key in test) {
      let numOfStars = 0;
      //   console.log(test.data[key]);
      const compare = test[key].split(" ");
      //   console.log(feeCurrency, 1, compare[1]);
      //   console.log(feeLocale, 2, compare[2]);
      //   console.log(byBrand, 3, compare[3]);
      //   console.log(byIssuer, 3, compare[3]);
      //   console.log(byID, 3, compare[3]);
      //   console.log(byNumber, 3, compare[3]);
      if (
        feeCurrency === compare[1] &&
        feeLocale === compare[2] &&
        (byBrand === compare[3] ||
          byIssuer === compare[3] ||
          byNumber === compare[3] ||
          byID === compare[3])
      ) {
        compatible = true;
        console.log(`this is fully compatible with ${test[key]}`);
        possible.push(test[key], numOfStars);
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
        console.log(feeCurrency !== compare[1] || compare[1] !== "*");
        console.log(`this is not compatible with ${test[key]}`);
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

        console.log(`COMPATIBLE with ${test[key]} with ${numOfStars} stars`);
        possible.push(test[key], numOfStars);
      }
      console.log(possible);

      //   const ha = "jesus";
      //   console.log(ha.substring(0, 1));

      //   //   console.log(test.data[key].substring(9, 20));
      //   const forCompare = test.data[key].split(" ");
      //   console.log(forCompare);
    }

    if (!possible[0]) {
      throw new APIError({
        status: httpStatus.BAD_REQUEST,
        message: `No Fee configuration for ${payload.Currency} transactions`,
        errors: `No Fee configuration for ${payload.Currency} transactions`,
      });
    }

    let stars = [];
    for (let i = 1; i < possible.length; i = i + 2) {
      stars.push(possible[i]);
    }
    console.log(stars);
    let lowestStar = Math.min(...stars);
    console.log(324, lowestStar);
    let selectedStar = possible.indexOf(lowestStar);
    let selectedFC = possible[selectedStar - 1];

    console.log("this is most appropraite", selectedFC);
    console.log(selectedFC.split(" "));
    console.log(selectedFC.split(" ")[6]);
    console.log(selectedFC.split(" ")[7]);
    feeType = selectedFC.split(" ")[6];
    feeValue = selectedFC.split(" ")[7];
    console.log(typeof parseInt(feeValue));

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
    console.log(feeValue, "is the charge");
    let chargeAmount = parseFloat(payload.Amount) + parseFloat(feeValue);

    const data = {
      AppliedFeeID: selectedFC.split(" ")[0],
      AppliedFeeValue: feeValue,
      ChargeAmount: chargeAmount,
      SettlementAmount: chargeAmount - feeValue,
    };

    console.log(data);
    const newData = JSON.stringify(data);
    client.set(JSON.stringify(payload.ID), newData);

    // let min = Math.min(possible);
    // console.log(min);

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
