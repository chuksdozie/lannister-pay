var express = require("express");
var router = express.Router();
var { feesComputation } = require("../controllers/Transactions");
var { transactionCache } = require("../middlewares/FeesMiddleware");

/* GET transactions */
// router.get("/", function (req, res, next) {
//   res.send("transaction router");
// });

/* Fee Computation endpoint */
router.post("/", transactionCache, async function (req, res, next) {
  try {
    const transactionPayload = req.body;
    const data = await feesComputation(transactionPayload);
    res.status(200).json({ status: data });
    return;
  } catch (error) {
    res.status(error.status).json({ error: error.message });
    next(error);
  }
});

module.exports = router;
