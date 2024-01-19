const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Fawn = require("fawn");
const { Rental, validate } = require("../models/rentals");
const { Customer } = require("../models/customers");
const { Movie } = require("../models/movies");
const auth = require("../middleware/auth");

Fawn.init(mongoose);

router.get("/", async (req, res) => {
  const rentals = await Rental.find();
  res.send(rentals);
});

router.get("/:id", async (req, res) => {
  const rental = await Rental.findById(req.params.id);
  if (!rental) return res.status(404).send("Rental not found");

  res.send(rental);
});

router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const movie = await Movie.findById(req.body.movieId);
  if (!movie) return res.status(404).send("Movie not found");

  if (movie.numberInStock === 0)
    return res.status(404).send("Movie not available");

  const customer = await Customer.findById(req.body.customerId);
  if (!customer) return res.status(404).send("Customer not found");

  const rental = new Rental({
    customer: {
      _id: customer._id,
      name: customer.name,
      isGold: customer.isGold,
      phone: customer.phone,
    },
    movie: {
      _id: movie._id,
      title: movie.title,
      dailyRentalRate: movie.dailyRentalRate,
    },
  });

  try {
    new Fawn.Task()
      .save("rentals", rental)
      .update("movies", { _id: movie._id }, { $inc: { numberInStock: -1 } })
      .run();

    res.send(rental);
  } catch (ex) {
    console.log(ex);
  }
});

router.put("/:id", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const rental = await Rental.findById(req.params.id);
  if (!rental) return res.status(404).send("Rental not found");

  const movie = await Movie.findById(req.body.movieId);
  if (!movie) return res.status(404).send("Movie not found");

  const customer = await Customer.findById(req.body.customerId);
  if (!customer) return res.status(404).send("Customer not found");

  rental.movie = movie;
  rental.customer = customer;

  res.send(await rental.save());
});

router.delete("/:id", auth, async (req, res) => {
  const rental = await Rental.findById(req.params.id);
  if (!rental) return res.status(404).send("Rental not found");

  res.send(await Rental.deleteOne(rental));
});

module.exports = router;
