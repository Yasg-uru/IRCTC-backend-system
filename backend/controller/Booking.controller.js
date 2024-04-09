import BookingModel from "../model/Booking.model.js";
import Trainmodel from "../model/train.model.js";
import catchasynerror from "../middleware/catchasynerror.middleware.js";
import Errorhandler from "../utils/Errorhandler.utils.js";
import { getSeatType } from "./Train.controller.js";
export const CreateBooking = catchasynerror(async (req, res, next) => {
  const user = req.user._id;

  const {
    name,

    age,
    Gender,
    trainid,
    date,
    from_station,
    to_station,
    coachType,
    seatNumber,
    categoryName,
  } = req.body;
  // console.log("this is a request body :", trainid);
  // we will receive this information by the users
  //now implementing the logic of the this seatnumber is booked or not at this date for from_station to to_station
  const existingbooking = await BookingModel.find({
    date,
    $or: [
      { from_station: { $in: [from_station, to_station] } },
      { to_station: { $in: [from_station, to_station] } },
    ],
    seats: {
      coachType,
      categoryName,
      seatNumber,
    },
  });
  // const overlap = existingbooking.some((booking) => {
  //   const isFromStationOverlap =
  //     booking.from_station !== to_station &&
  //     booking.from_station !== from_station;
  //   const isToStationOverlap =
  //     booking.to_station !== to_station && booking.to_station !== from_station;
  //   return !(isFromStationOverlap && isToStationOverlap);
  // });
  const train = await Trainmodel.findById(trainid);
  // console.log("this is a train :", train);

  const intermediate_stations = train.intermediate_stations;
  const overlap = existingbooking.some((booking) => {
    const fromIndex = intermediate_stations.indexOf(from_station);
    const toIndex = intermediate_stations.indexOf(to_station);
    const bookingFromIndex = intermediate_stations.indexOf(
      booking.from_station
    );
    const bookingToIndex = intermediate_stations.indexOf(booking.to_station);

    // Check if the booking overlaps with the specified journey segment
    return (
      (bookingFromIndex <= fromIndex && bookingToIndex >= fromIndex) ||
      (bookingFromIndex <= toIndex && bookingToIndex >= toIndex) ||
      (bookingFromIndex >= fromIndex && bookingToIndex <= toIndex)
    );
  });

  if (overlap) {
    return next(
      new Errorhandler(
        "Seats between selected stations are already booked.",
        400
      )
    );
  }
  const Booking = await BookingModel.find({
    date,
    from_station,
    to_station,
  });

  const booked_seats = Booking.filter((booking) =>
    // booking.seats.some(
    //   (seat) => seat.coachType === coachType && seat.seatNumber === seatNumber
    // )
    {
      return (
        booking.seats.coachType === coachType &&
        booking.seats.categoryName == categoryName &&
        booking.seats.seatNumber === seatNumber
      );
    }
  );
  const isAvailable = booked_seats.length === 0;
  // console.log("seat is available ", isAvailable);
  if (!isAvailable) {
    return next(
      new Errorhandler(
        "Seats between selected stations are already booked.",
        404
      )
    );
  }
  //now creating the booking of the train for from_station to to_station
  const seats = {
    coachType: coachType,
    categoryName,
    seatNumber: seatNumber,
    isBooked: true,
  };
  const booking = await BookingModel.create({
    name,
    user,
    age,
    Gender,
    trainid,
    date,
    from_station,
    to_station,
    seats,
  });

  const { schedule } = train;
  let fd = schedule.find((s) => s.stationName === from_station);
  let td = schedule.find((s) => s.stationName === to_station);
  if (!fd || !td) {
    return next(new Errorhandler("Invalid stations"));
  }
  const totalDistance = td.distance - fd.distance;
  let departuretime = new Date(date + "T" + fd.departureTime);
  let arrivaldate = new Date(date + "T" + td.arrivalTime);
  if (arrivaldate < departuretime) {
    arrivaldate.setDate(arrivaldate.getDate() + 1);
  }
  const arrivaltime = td.arrivalTime;
  const seatType = getSeatType(seatNumber);
  const trainname = train.name;
  const train_Number = train.Train_no;

  res.status(200).json({
    success: true,
    message: "Your ticket booked successfully",
    booking,
    startDate: departuretime.toDateString(), // assuming 'date' is the start date
    endDate: arrivaldate.toDateString(), // use adjusted arrival date
    totalDistance,
    arrivaltime,
    seatType,
    trainname,
    train_Number,
  });
});

export const getavailableseatcounts = catchasynerror(async (req, res, next) => {
  try {
    const { trainid, date, from_station, to_station, coachtype } = req.body;
    const train = await Trainmodel.findById(trainid);
    if (!train) {
      return next(new Errorhandler("train not found", 404));
    }

    const existcoach = train.coaches.find((coach) => {
      return coach.coachType === coachtype;
    });
    if (!existcoach) {
      return next(
        new Errorhandler(`${coachtype} is not found in this train `, 404)
      );
    }
    //now calculate the total number of seats in the entered coachtype
    const totalseats = existcoach.coachcategory.reduce(
      (acc, category) => acc + category.seats.length,
      0
    );

    //calculate the booked seats of the entered coach category
    // const seats={}
    // seats.coachType=coachtype;
    const bookedseats = await BookingModel.find({
      trainid,
      date,
      from_station,
      to_station,
      "seats.coachType": coachtype,
    });
    const bookedcoachcounts = bookedseats.reduce((acc, curr) => acc + 1, 0);
    const availablecounts = totalseats - bookedcoachcounts;
    res.status(200).json({
      success: true,
      message: "successfully",
      availablecounts,
      totalseats,
      bookedcoachcounts,
    });
  } catch (error) {
    next(new Errorhandler(error?.message, 500));
  }
});
export const vacant_booked_seat_charts = catchasynerror(
  async (req, res, next) => {
    try {
      let { trainid, from_station, to_station, coachType, categoryName, date } =
        req.body;
      date = new Date(date);
      const dateString = date.toISOString().split("T")[0] + "T08:00:00Z";
      console.log("this is date string :", dateString);
      const bookings = await BookingModel.find({
        date: dateString,
        trainid,
        from_station,
        to_station,
        "seats.coachType": coachType,
        "seats.categoryName": categoryName,
      });
      if (!bookings) {
        return next(new Errorhandler("bookings not found ", 404));
      }
      res.status(200).json({
        success: true,
        Bookings: bookings,
      });
    } catch (error) {
      return next(new Errorhandler(error?.message, 500));
    }
  }
);
