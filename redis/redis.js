var redis = require("redis");

// redis setup
const REDIS_PORT = process.env.REDIS_PORT || "6377";
const client = redis.createClient(REDIS_PORT);

(async () => {
  await client.connect();
})();

client.on("connect", () => console.log("::> Redis Client Connected"));
client.on("error", (err) => console.log("<:: Redis Client Error", err));

module.exports = client;
