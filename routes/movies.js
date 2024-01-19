const express = require("express");
const router = express.Router();
const { Movie, validate } = require("../models/movies");
const { Genre } = require("../models/genres");
const auth = require("../middleware/auth");

router.get("/", async (req, res) => {
  const movies = await Genre.find();
  res.send(movies);
});

router.get("/:id", async (req, res) => {
  const movie = await Movie.findById(req.params.id);
  if (!movie) return res.status(404).send("Movie not found");
  res.send(movie);
});

router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const genre = await Genre.findById(req.body.genreId);
  if (!genre) return res.status(404).send("Genre not found");

  const movie = new Movie({
    title: req.body.title,
    genre: { _id: genre.id, name: genre.name },
  });

  res.send(await movie.save());
});

router.put("/:id", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const movie = await Movie.findById(req.params.id);
  if (!movie) return res.status(404).send("Movie not found");

  movie.title = req.body.title;
  movie.genreId = req.body.genreId;
  movie.numberInStock = req.body.numberInStock;
  movie.dailyRentalRate = req.body.dailyRentalRate;

  res.send(await movie.save());
});

router.delete("/:id", auth, async (req, res) => {
  const movie = await Movie.findById(req.params.id);
  if (!movie) return res.status(404).send("Movie not found");

  res.send(await Movie.deleteOne(movie));
});

module.exports = router;
