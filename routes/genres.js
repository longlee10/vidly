const { Genre, validate } = require("../models/genres");
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const asyncMiddleware = require("../middleware/async");
const validateObjectId = require("../middleware/validateObjectId");

router.get(
  "/",
  asyncMiddleware(async (req, res) => {
    // throw new Error("Could not get genres");
    const genres = await Genre.find();
    res.send(genres);
  })
);

router.get("/:id", validateObjectId, async (req, res) => {
  const genre = await Genre.findById(req.params.id);
  if (!genre) return res.status(404).send("Genre not found");

  res.send(genre);
});

router.post("/", auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const genre = new Genre({ name: req.body.name });
  res.send(await genre.save());
});

// update individual genre
router.put("/:id", [auth, validateObjectId], async (req, res) => {
  const genre = await Genre.findById(req.params.id);
  if (!genre) return res.status(404).send("Genre not found");

  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  genre.name = req.body.name;
  res.send(await genre.save());
});

// delete individual genre
router.delete("/:id", [auth, admin], async (req, res) => {
  const genre = await Genre.findById(req.params.id);
  if (!genre) return res.status(404).send("Genre not found");

  res.send(await Genre.deleteOne(genre));
});

module.exports = router;
