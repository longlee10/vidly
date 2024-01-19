const request = require("supertest");
let server = require("../../app");
const { User } = require("../../models/users");

describe("auth.js", () => {
  let token;
  const exec = () => {
    return request(server)
      .post("/api/genres")
      .set("x-auth-token", token)
      .send({ name: "genre1" });
  };

  beforeEach(() => {
    server = require("../../app");
    token = new User().generateAuthToken();
  });

  //  clean up after modifying state
  afterEach(async () => {
    server.close();
  });

  it("should return 401 if header is not provided", async () => {
    token = "";
    const res = await exec();
    expect(res.status).toBe(401);
  });

  it("should return 400 if header is invalid", async () => {
    token = "12345";
    const res = await exec();
    expect(res.status).toBe(400);
  });

  it("should return 200 if token is valid", async () => {
    const res = await exec();
    expect(res.status).toBe(200);
  });
});
