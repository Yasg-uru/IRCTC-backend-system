import mongoose, { Schema, model } from "mongoose";
const bookingSchema = new Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  name: {
    type: String,
    required: [true, "please enter name"],
  },
  age: {
    type: Number,
    required: [true, "please Enter your age"],
  },
  Gender: {
    type: String,
    required: [true, "please Select your gender"],
  },

  trainid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Train",
  },
  date: {
    type: Date,
    required: true,
  },
  from_station: {
    type: String,
    required: true,
  },
  to_station: {
    type: String,
    required: true,
  },
  seats: {
    coachType: String,
    categoryName: String,
    seatNumber: Number,
    isBooked: {
      type: Boolean,
      default: false,
    },
  },
});
const bookingmodel = model("booking", bookingSchema);
export default bookingmodel;
