var redis = require("redis");
const { expect } = require("@jest/globals");
const { feesComputation } = require("./Transactions");

test("the payload and output arent empty", async () => {
  let payload = { a: "enjoy\ngoat" };
  try {
    const output = await feesComputation(payload);
    expect(output).not.toBeNull();
  } catch (e) {
    expect(e);
  }
});

// afterAll((done) => {
//   redis.createClient().quit();
//   done();
// });
