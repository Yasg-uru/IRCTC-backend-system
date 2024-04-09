import Errorhandler from "../utils/Errorhandler.utils.js";
import jwt from "jsonwebtoken";
import User from "../model/user.model.js";
export const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    console.log("this is a token in auth middleware"+token)
    if (!token) {
      return next(new Errorhandler("token is undefined please login to continue ", 404));
    }
    const decodeddata = jwt.verify(token, process.env.JWT_SECRET);

    // req.user = await User.findOne({id:decodeddata.id});
    console.log("this is a decoded data :"+decodeddata)
    req.user = await User.findById(decodeddata.id);

    return next();
  } catch (error) {
    return next(new Errorhandler(error?.message, 404));
  }
};
export const authorization = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new Errorhandler(
          `${req.user.role} is not allowed to access this resources`
        )
      );
    }
    return next();
  };
};
