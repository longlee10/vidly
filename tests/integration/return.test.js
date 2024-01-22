const request = require("supertest");
let server;
const { User } = require("../../models/users");
const { Rental } = require("../../models/rentals");
const { Movie } = require("../../models/movies");
const mongoose = require("mongoose");
const moment = require("moment");

describe("POST /return", () => {
  let token;
  let customerId;
  let movieId;
  let rental;
  let customer;
  let movie;

  const exec = () => {
    return request(server)
      .post("/api/returns")
      .set("x-auth-token", token)
      .send({ customerId, movieId });
  };

  beforeEach(async () => {
    server = require("../../app");
    customerId = new mongoose.Types.ObjectId();
    movieId = new mongoose.Types.ObjectId();
    customer = {
      _id: customerId,
      name: "12345",
      phone: "12345678910",
    };
    movie = {
      _id: movieId,
      title: "12345",
      dailyRentalRate: 2,
    };

    movie = new Movie({
      _id: movieId,
      title: "12345",
      dailyRentalRate: 2,
      genre: { name: "12345" },
      numberInStock: 10,
    });
    await movie.save();

    rental = new Rental({
      customer,
      movie,
    });
    await rental.save();

    token = new User().generateAuthToken();
  });

  afterEach(async () => {
    await server.close();
    await Rental.deleteMany({});
    await Movie.deleteMany({});
  });

  it("should return 401 if the user not logged in", async () => {
    token = "";
    const res = await exec();
    expect(res.status).toBe(401);
  });

  it("should return 400 if no customerId", async () => {
    customerId = null;
    const res = await exec();
    expect(res.status).toBe(400);
  });

  it("should return 400 if no movieId", async () => {
    movieId = null;
    const res = await exec();
    expect(res.status).toBe(400);
  });

  it("should return 404 if no rental found for this customer and movie", async () => {
    await Rental.deleteMany({});
    const res = await exec();
    expect(res.status).toBe(404);
  });

  it("should return 400 if return already processed", async () => {
    rental.dateReturned = new Date();
    await rental.save();

    const res = await exec();
    expect(res.status).toBe(400);
  });

  it("should return 200 if request is valid", async () => {
    const res = await exec();
    expect(res.status).toBe(200);
  });

  it("should set the return date", async () => {
    await exec();
    const rentalInDb = await Rental.findById(rental._id);
    const diff = new Date() - rentalInDb.dateReturned;
    expect(diff).toBeLessThan(10 * 1000);
  });

  it("should calculate the rental fee", async () => {
    rental.dateOut = moment().add(-7, "days").toDate();
    await rental.save();
    await exec();
    const rentalInDb = await Rental.findById(rental._id);
    expect(rentalInDb.rentalFee).toBe(14);
  });

  it("should increase the stock", async () => {
    const movieInDB = await Movie.findById(movieId);
    await exec();

    expect(movieInDB.numberInStock).toBe(movie.numberInStock + 1);
  });

  it("should return the rentals", async () => {
    const res = await exec();
    expect(Object.keys(res.body)).toEqual(
      expect.arrayContaining([
        "dateOut",
        "dateReturned",
        "rentalFee",
        "customer",
        "movie",
      ])
    );
  });
});
