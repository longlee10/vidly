let server;
const request = require("supertest");
const { Genre } = require("../../models/genres");
const { User } = require("../../models/users");
const mongoose = require("mongoose");

describe("/api/genres", () => {
  beforeEach(() => (server = require("../../app")));
  afterEach(async () => {
    //  clean up after modifying state
    server.close();
    await Genre.deleteMany({});
  });

  describe("GET/", () => {
    it("Should return all genres", async () => {
      await Genre.collection.insertMany([
        { name: "genre1" },
        { name: "genre2" },
      ]);

      const res = await request(server).get("/api/genres");
      expect(res.status).toBe(200);
      // expect(res.body.length).toBe(2);
      expect(res.body.some((g) => g.name === "genre1")).toBeTruthy();
      expect(res.body.some((g) => g.name === "genre2")).toBeTruthy();
    });
  });

  describe("GET/:id", () => {
    it("Should return individual genre", async () => {
      const id = new mongoose.Types.ObjectId();
      await Genre.collection.insertOne(new Genre({ _id: id, name: "genre1" }));

      const res = await request(server).get(`/api/genres/${id}`);

      expect(res.status).toBe(200);
      expect(res.body.name === "genre1").toBeTruthy();
    });

    it("Should respond 404", async () => {
      const res = await request(server).get(`/api/genres/1`);
      expect(res.status).toBe(404);
    });
  });

  describe("POST /", () => {
    let token;
    let name;

    const exec = async () => {
      return await request(server)
        .post("/api/genres")
        .set("x-auth-token", token)
        .send({ name });
    };

    beforeEach(() => {
      token = new User().generateAuthToken();
      name = "genre1";
    });

    it("Should return 401 if user not logged in", async () => {
      token = "";
      const res = await exec();
      expect(res.status).toBe(401);
    });

    it("Should return 400 if genre is < 5 characters", async () => {
      name = "1234";
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("Should return 400 if genre is > 50 characters", async () => {
      name = new Array(52).join("a");
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("Should save if the genre is valid", async () => {
      await exec();

      const genre = await Genre.findOne({ name: "genre1" });
      expect(genre).not.toBeNull();
    });

    it("Should return if the genre is valid", async () => {
      const res = await exec();

      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", "genre1");
    });
  });

  describe("PUT /:id", () => {
    let token;
    let newGenreName;
    let genre;
    let id;

    beforeEach(async () => {
      genre = new Genre({ name: "Genre1" });
      await genre.save();

      token = new User().generateAuthToken();
      id = genre._id;
      newGenreName = "updatedName";
    });

    const exec = async () => {
      return await request(server)
        .put(`/api/genres/${id}`)
        .set("x-auth-token", token)
        .send({ name: newGenreName });
    };

    // test 401: not logged in
    it("Should return 401 if user not logged in", async () => {
      token = "";
      const res = await exec();
      expect(res.status).toBe(401);
    });

    // test 400: genre length < 4 or > 50
    it("should return 400 if genre length < 5", async () => {
      newGenreName = "1234";
      const res = await exec();
      expect(res.status).toBe(400);
    });

    it("should return 400 if genre length > 50", async () => {
      newGenreName = new Array(52).join("a");
      const res = await exec();
      expect(res.status).toBe(400);
    });

    // test 404
    it("Should return 404 if id is invalid", async () => {
      id = 1;
      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("Should return 404 if no genre is asscociated with a valid id", async () => {
      id = new mongoose.Types.ObjectId();
      const res = await exec();

      expect(res.status).toBe(404);
    });

    it("should return the updated object if updated successful", async () => {
      const res = await exec();
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("name", newGenreName);
    });
  });
});
