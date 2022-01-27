var express = require("express");
var router = express.Router();

/* GET transactions */
router.get("/", function (req, res, next) {
  res.send("transaction router");
});

module.exports = router;
