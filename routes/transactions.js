var express = require("express");
var router = express.Router();
var { feesComputation } = require("../controllers/Transactions");

/* GET transactions */
router.get("/", function (req, res, next) {
  res.send("transaction router");
});

/* Fee Computation endpoint */
router.post("/", async function (req, res, next) {
  try {
    const x = req.body;

    const data = await feesComputation(x);
    res.status(200).json({ status: data });
    return;
  } catch (error) {
    console.error(error);
    res.status(error.status).json({ error: error.message });
    next(error);
  }
});

module.exports = router;
