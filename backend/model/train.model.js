import mongoose, { Schema, model } from "mongoose";

const TrainSchema = new Schema({
  name: {
    type: String,
    require: [true, "please enter the Train name"],
  },
  Train_no: {
    type: Number,
    require: [true, "please Enter the train number"],
  },
  category: {
    type: String,
    require: [true, "please enter the category of the train"],
  },
  origin: {
    type: String,
    require: [true, "please enter the origin of the train"],
  },
  destination: {
    type: String,
    require: [true, "please Enter destination of the train"],
  },
  intermediate_stations: [String],
  coaches: [
    {
      coachType: String,
      coachcategory: [
        {
          name: String,
          seats: [
            {
              seatNumber: Number,
            },
          ],
        },
      ],
    },
  ],
  price: {
    type: Map,
    of: Number,
  },
  schedule: [
    {
      serialNo: Number,
      stationCode: String,
      stationName: String,
      routeNumber: Number,
      arrivalTime: String,
      departureTime: String,
      haltTime: String,
      distance: Number,
      day: Number,
    },
  ],
  runningDays: {
    type: [Number],
    required: [true, "Please specify the running days of the train"],
  },
});

const Trainmodel = model("Train", TrainSchema);
export default Trainmodel;
