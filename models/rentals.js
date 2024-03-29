const mongoose = require("mongoose");
const Joi = require("joi");
const moment = require("moment");

const movieSchema = new mongoose.Schema({
  title: { type: String, min: 3, max: 255, required: true },
  dailyRentalRate: { type: Number, default: 0 },
});

const customerSchema = new mongoose.Schema({
  name: { type: String, min: 3, max: 255, required: true },
  isGold: { type: Boolean, default: false },
  phone: { type: String, min: 10, max: 12, required: true },
});

const rentalSchema = new mongoose.Schema({
  customer: { type: customerSchema, required: true },
  movie: { type: movieSchema, required: true },
  dateOut: { type: Date, default: Date.now() },
  dateReturned: { type: Date },
  rentalFee: { type: Number, min: 0 },
});

rentalSchema.statics.lookup = function (customerId, movieId) {
  return this.findOne({
    "customer._id": customerId,
    "movie._id": movieId,
  });
};

rentalSchema.methods.return = function () {
  this.dateReturned = new Date();

  this.rentalFee =
    moment().diff(this.dateOut, "days") * this.movie.dailyRentalRate;
};

const Rental = mongoose.model("Rental", rentalSchema);

function validateRental(rental) {
  const schema = {
    customerId: Joi.objectId().required(),
    movieId: Joi.objectId().required(),
  };

  return Joi.validate(rental, schema);
}

exports.Rental = Rental;
exports.validate = validateRental;
