import Trainmodel from "../model/train.model.js";
import catchasynerror from "../middleware/catchasynerror.middleware.js";
import Errorhandler from "../utils/Errorhandler.utils.js";
import bookingmodel from "../model/Booking.model.js";
export const create_Train = catchasynerror(async (req, res, next) => {
  try {
    const {
      name,
      Train_no,
      category,
      origin,
      destination,
      intermediate_stations,
      coaches,
      price,
      date,
      schedule,
      runningDays,
    } = req.body;

    let seatNumber = 1;
    function generateseatnumber() {
      let seatNumbers = [];
      for (let i = 1; i <= 60; i++) {
        seatNumbers.push({ seatNumber: i });
      }
      return seatNumbers;
    }
    coaches?.forEach((coach) => {
      coach.coachcategory.seats = [];

      coach.coachcategory.forEach((category) => {
        category.seats = generateseatnumber();
      });
    });

    const train = await Trainmodel.create({
      name,
      Train_no,
      category,
      origin,
      destination,
      intermediate_stations,
      coaches,
      price,
      schedule,
      runningDays,
    });
    res.status(200).json({
      success: true,
      message: "Train created successfully",
      train,
    });
  } catch (error) {
    return next(new Errorhandler(error?.message, 500));
  }
});

export const searchtrainbyorigintodestination = catchasynerror(
  async (req, res, next) => {
    try {
      const { fromstation, tostation, date } = req.body;
      console.log(
        "this is from stattion and tostation:" +
          fromstation +
          "  " +
          tostation +
          "     " +
          date
      );
      const selectedday = new Date(date);
      const selectedDay = selectedday.getDay();

      const train = await Trainmodel.find({
        intermediate_stations: {
          $all: [fromstation, tostation],
        },
      });
      if (train.length == 0) {
        return next(new Errorhandler("train not found ", 404));
      }
      const resultarray = [];
      for (const Train of train) {
        if (!Train?.runningDays.includes(selectedDay)) {
          continue;
        }
        const fromstation_index = Train.intermediate_stations.findIndex(
          (station) => station === fromstation
        );
        const tostation_index = Train.intermediate_stations.findIndex(
          (station) => station === tostation
        );
        if (fromstation_index >= tostation_index) {
          // return next(new Errorhandler("train is not available ", 404));
          continue;
        }
        resultarray.push(Train);
      }

      res.status(200).json({
        success: true,
        resultarray,
      });
    } catch (error) {
      next(new Errorhandler(error?.message, 500));
    }
  }
);
//creating controller for finding the cost of the ticket for particular train with their particular coach fromstation tostation

export const getcostofticket = catchasynerror(async (req, res, next) => {
  try {
    const { trainid, fromstation, tostation } = req.body;
    const train = await Trainmodel.findById(trainid);
    if (!train) {
      return next(new Errorhandler("train not found ", 404));
    }
    // const isexistcoachtype = train.coaches.find((coach) => {
    //   return coach.coachType === coachType;
    // });
    // if (!isexistcoachtype) {
    //   return next(new Errorhandler("Invalid coachtype", 404));
    // }

    //finding the indexes of the fromstation and tostation

    const fromindex = train.intermediate_stations.indexOf(fromstation);
    const tostationindex = train.intermediate_stations.indexOf(tostation);
    if (
      fromindex === -1 ||
      tostationindex === -1 ||
      fromindex >= tostationindex
    ) {
      return next(new Errorhandler("Invalid stations "));
    }
    let totalfare = 0;

    for (let i = fromindex; i <= tostationindex; i++) {
      console.log("this is inside loop ");
      const station = train.intermediate_stations[i];
      totalfare += train.price.get(station);
    }
    let pricemap = {};

    train.coaches.forEach((coach) => {
      if (coach.coachType === "AC") {
        let coachtype = coach.coachType;
        pricemap[coachtype] = totalfare * 1.5;
      } else if (coach.coachType == "Sleeper") {
        let coachtype = coach.coachType;
        pricemap[coachtype] = totalfare;
      }
    });

    res.status(200).json({
      success: true,
      price: pricemap,
    });
  } catch (error) {
    return next(new Errorhandler(error?.message, 500));
  }
});
export const getAvailableSeatCountsForAllCoachTypes = catchasynerror(
  async (req, res, next) => {
    try {
      const { trainid, fromstation, tostation } = req.body;
      let { date, coachTypes } = req.body;

      console.log("thi is a infomation insidethe req.body:", req.body);

      date = date ? new Date(date) : new Date(Date.now());

      //if we are creating frontend of this website then date is receving by the frontend

      const { previousdate, nextdate } = req.query;
      if (nextdate === "true") {
        date.setDate(date.getDate() + 1);
      } else if (previousdate === "true") {
        date.setDate(date.getDate() - 1);
      }
      const dateString = date.toISOString();
      // const dateString = date.toISOString().split("T")[0] + "T08:00:00Z";
      console.log("Date:", dateString);
      const train = await Trainmodel.findById(trainid);
      if (!train) {
        return next(new Errorhandler("Train not found ", 404));
      }
      const arrayofseats = [];
      //now we are using the for of loop
      for (const coach of train.coaches) {
        const totalseats = coach.coachcategory.reduce(
          (acc, category) => acc + category.seats.length,
          0
        );
        const bookedseats = await bookingmodel.find({
          trainid,
          date: dateString,
          from_station: fromstation,
          to_station: tostation,
          "seats.coachType": coach.coachType,
        });
        const bookedseatscount = bookedseats.length;
        console.log("this is a length of booked seats:", bookedseatscount);
        const availableseatcountsforcoach = totalseats - bookedseatscount;
        const coachtypename = coach.coachType;

        arrayofseats.push({
          totalseats,
          bookedSeats: bookedseatscount,
          availableSeat: availableseatcountsforcoach,
          coachtypename,
        });
      }
      res.status(200).json({
        success: true,
        arrayofseats,
      });
    } catch (error) {
      return next(new Errorhandler(error?.message, 500));
    }
  }
);

export const getseatavailabilityofallthetrains = catchasynerror(
  async (req, res, next) => {
    try {
      const { fromstation, tostation } = req.body;
    } catch (error) {}
  }
);

 export function getSeatType(seatNumber) {
  // Calculate theseatNumber when dividing seatNumber by 16

  // Determine the seat type based on theseatNumber
  if (
    seatNumber === 1 ||
    seatNumber === 4 ||
    seatNumber === 9 ||
    seatNumber === 12 ||
    seatNumber === 17 ||
    seatNumber === 20 ||
    seatNumber === 25 ||
    seatNumber === 28 ||
    seatNumber === 33 ||
    seatNumber === 36 ||
    seatNumber === 41 ||
    seatNumber === 44 ||
    seatNumber === 49 ||
    seatNumber === 52 ||
    seatNumber === 57 ||
    seatNumber === 60
  ) {
    return { seatNumber, seatType: "Lower" };
  } else if (
    seatNumber === 2 ||
    seatNumber === 5 ||
    seatNumber === 10 ||
    seatNumber === 13 ||
    seatNumber === 18 ||
    seatNumber === 21 ||
    seatNumber === 26 ||
    seatNumber === 29 ||
    seatNumber === 34 ||
    seatNumber === 37 ||
    seatNumber === 42 ||
    seatNumber === 45 ||
    seatNumber === 50 ||
    seatNumber === 53 ||
    seatNumber === 58
  ) {
    return { seatNumber, seatType: "Middle" };
  } else if (
    seatNumber === 3 ||
    seatNumber === 6 ||
    seatNumber === 11 ||
    seatNumber === 14 ||
    seatNumber === 19 ||
    seatNumber === 22 ||
    seatNumber === 27 ||
    seatNumber === 30 ||
    seatNumber === 35 ||
    seatNumber === 38 ||
    seatNumber === 43 ||
    seatNumber === 46 ||
    seatNumber === 51 ||
    seatNumber === 54 ||
    seatNumber === 59
  ) {
    return { seatNumber, seatType: "Upper" };
  } else if (
    seatNumber === 7 ||
    seatNumber === 15 ||
    seatNumber === 23 ||
    seatNumber === 31 ||
    seatNumber === 39 ||
    seatNumber === 47 ||
    seatNumber === 55 ||
    seatNumber === 63 ||
    seatNumber === 71
  ) {
    return { seatNumber, seatType: "Side Lower" };
  } else {
    return { seatNumber, seatType: "Side Upper" };
  }
}

export const assignseatsforallcoaches = catchasynerror(
  async (req, res, next) => {
    try {
      const { trainid, date, fromstation, tostation } = req.body;
      console.log(
        "this is a trainid and others ",
        trainid,
        date,
        fromstation,
        tostation
      );
      const [year, month, day] = date.split("T")[0].split("-");

      // Format the date
      const formattedDate = `${year}-${month}-${day}`;
      const train = await Trainmodel.findById(trainid);
      if (!train) {
        return next(new Errorhandler("train not found ", 404));
      }
      const bookings = await bookingmodel.find({
        trainid,
        date: formattedDate,
        from_station: fromstation,
        to_station: tostation,
      });
      const array = [];
      train.coaches.forEach((coach) => {
        coach.coachcategory.forEach((category) => {
          const arrayofseats = [];
          category.seats.forEach((seat) => {
            // console.log(getSeatType(seat.seatNumber));
            const seattype = getSeatType(seat.seatNumber);
            const isBooked = bookings.some((booking) => {
              return (
                booking.seats.coachType === coach.coachType &&
                booking.seats.categoryName === category.name &&
                booking.seats.seatNumber === seat.seatNumber
              );
            });
            arrayofseats.push({ SeatType: seattype, isBooked: isBooked });
            seat.seatType = seattype;
            // console.log("this is a seat type :", seat.seatType);
          });
          const categoryname = category.name;
          const coachTypes = coach.coachType;
          array.push({ categoryname, coachTypes, arrayofseats });
        });
      });
      const savedtrain = await train.save();
      res.status(200).json({
        success: true,
        savedtrain,
        array,
      });
    } catch (error) {
      return next(new Errorhandler(error?.message, 500));
    }
  }
);
