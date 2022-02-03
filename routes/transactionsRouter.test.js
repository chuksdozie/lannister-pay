const { expect } = require("@jest/globals");
const request = require("supertest");
const app = require("../app");
const client = require("../redis/redis");

describe("Transactions POST Endpoint", () => {
  it("should throw error if no input or wrong input", async () => {
    const payload = {
      ID: 91203,
      Amount: 5000,
      Currency: "NG",
      CurrencyCountry: "NG",
      Customer: {
        ID: 2211232,
        EmailAddress: "anonimized29900@anon.io",
        FullName: "Abel Eden",
        BearsFee: true,
      },
      PaymentEntity: {
        ID: 2203454,
        Issuer: "GTBANK",
        Brand: "MASTERCARD",
        Number: "530191******2903",
        SixID: 530191,
        Type: "CREDIT-CARD",
        Country: "NG",
      },
    };
    const res = await request(app).post("/fees").send(payload);
    expect(payload).not.toBeNull();
    if (!payload) {
      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty("error");
    } else {
      expect(payload).toHaveProperty("ID");
      expect(payload).toHaveProperty("Amount");
      expect(payload).toHaveProperty("Currency");
      expect(payload.Customer).toHaveProperty("ID");
      expect(payload.Customer).toHaveProperty("EmailAddress");
      expect(payload).toHaveProperty("Customer");
      expect(payload).toHaveProperty("PaymentEntity");
      expect(payload.PaymentEntity).toHaveProperty("ID");
      expect(payload.PaymentEntity).toHaveProperty("Number");
      expect(payload.PaymentEntity).toHaveProperty("Type");

      if (payload.Currency !== "NGN") {
        expect(res.statusCode).toEqual(400);
        expect(res.body).toHaveProperty("error");
      }
    }
  });
});
