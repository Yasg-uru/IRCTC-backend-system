import express from "express";
import { isAuthenticated } from "../middleware/auth.middleware.js";
import {
  CreateBooking,
  getavailableseatcounts,
  vacant_booked_seat_charts,
} from "../controller/Booking.controller.js";
const router = express.Router();
router.route("/seatBooking").post(isAuthenticated, CreateBooking);
router.route("/getavailable-seats").post(getavailableseatcounts);
router.route("/seatchart").get(vacant_booked_seat_charts);
export default router;
