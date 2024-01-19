const mongoose = require("mongoose");
const Joi = require("joi");
const { genreSchema } = require("./genres");

const movieSchema = new mongoose.Schema({
  title: { type: String, required: true },
  genre: { type: genreSchema, required: true },
  numberInStock: { type: Number, default: 0 },
  dailyRentalRate: { type: Number, default: 0 },
});

const Movie = mongoose.model("Movie", movieSchema);

function validateMovies(movie) {
  const schema = {
    title: Joi.string().min(3).required(),
    genreId: Joi.objectId().required(),
    numberInStock: Joi.number(),
    dailyRentalRate: Joi.number(),
  };

  return Joi.validate(movie, schema);
}

exports.Movie = Movie;
exports.validate = validateMovies;
