var redis = require("redis");

// redis setup
const REDIS_PORT = process.env.REDIS_PORT || "6379";
const client = redis.createClient({ url: process.env.REDIS_URL });

(async () => {
  await client.connect();
})();

client.on("connect", () => console.log("::> Redis Client Connected"));
client.on("error", (err) => console.log("<:: Redis Client Error", err));

module.exports = client;
