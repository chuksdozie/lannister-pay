var express = require("express");
var router = express.Router();

const { feesSetup, fees } = require("../controllers/Fees");
const { getFeesCache } = require("../middlewares/FeesMiddleware");

/* GET fees. */
router.get("/", getFeesCache, async function (req, res, next) {
  try {
    console.log("from request");
    const data = await fees();
    res.status(200).json({ data });
    return;
  } catch (error) {
    console.error(error);
    res.send({ error: error.message });
    next(error);
  }
});

/* CREATE Fees Setup */
router.post("/", async function (req, res, next) {
  try {
    const x = req.body;
    const data = await feesSetup(x);
    res.status(201).json({ status: "ok" });
    return;
  } catch (error) {
    console.error(error);
    res.send({ error: error.message });
    next(error);
  }
});

module.exports = router;
