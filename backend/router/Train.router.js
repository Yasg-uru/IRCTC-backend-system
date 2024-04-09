import express from "express";
import {
  assignseatsforallcoaches,
  create_Train,
  getAvailableSeatCountsForAllCoachTypes,
  getcostofticket,
  searchtrainbyorigintodestination,
} from "../controller/Train.controller.js";
const router = express.Router();

router.route("/create").post(create_Train);
router.route("/search").post(searchtrainbyorigintodestination);
router.route("/getavailability").post(getAvailableSeatCountsForAllCoachTypes);
router.route("/price/ticket").post(getcostofticket);
router.route("/assignseat").post(assignseatsforallcoaches);

export default router;
