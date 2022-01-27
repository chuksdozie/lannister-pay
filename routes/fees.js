var express = require("express");
var router = express.Router();
var client = require("../redis/redis");

const { feesSetup } = require("../controllers/Fees");

/* GET fees. */
router.get("/", function (req, res, next) {
  res.send("fees router");
});

/* CREATE Fees Setup */
router.post("/", async function (req, res, next) {
  try {
    const data = await feesSetup();
    const newData = JSON.stringify(data);
    console.log(newData);

    // console.log(222, JSON.stringify(data));
    // console.log(
    //   99322,
    //   JSON.parse(
    //     JSON.stringify({
    //       1: "LNPY1221 NGN * *(*) : APPLY PERC 1.4",
    //       2: "LNPY1222 NGN INTL CREDIT-CARD(VISA) : APPLY PERC 5.0",
    //       3: "LNPY1223 NGN LOCL CREDIT-CARD(*) : APPLY FLAT_PERC 50:1.4",
    //       4: "LNPY1224 NGN * BANK-ACCOUNT(*) : APPLY FLAT 100",
    //       5: "LNPY1225 NGN * USSD(MTN) : APPLY PERC 0.55",
    //     })
    //   )
    // );
    client.set("fees", newData);

    const myst = await client.get("fees");
    console.log(9999, myst);
    const getData = JSON.parse(myst);
    console.log(836483, getData);
    res.send({ status: "ok" });
  } catch (error) {
    res.status(500);
  }
});

module.exports = router;
