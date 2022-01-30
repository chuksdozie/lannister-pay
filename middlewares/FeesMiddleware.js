const client = require("../redis/redis");
var { APIError } = require("../config/error");
const httpStatus = require("http-status");

// cache middleware for get fees route
const getFeesCache = async (req, res, next) => {
  try {
    let data = await client.get("fees");
    data = JSON.parse(data);
    if (data !== null) {
      console.log("from cache");
      res.status(200).json({ data });
      //   return;
    } else {
      next();
    }
  } catch (error) {
    next();
  }
};

// middleware for the post transaction route

module.exports = {
  getFeesCache,
};
