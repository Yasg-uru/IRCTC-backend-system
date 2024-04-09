import mongoose, { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
const userSchema = new Schema({
  name: {
    type: String,
    require: [true, "please enter your name "],
  },
  email: {
    type: String,
    unique: true,
    match: [/^\S+@\S+\.\S+$/, "Invalid email address"],
    require: true,
  },
  profile: {
    type: String,
  },
  password: {
    type: String,
    require: [true, "please enter password"],
  },

  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  bookedTickets: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "booking",
  },

  resetPasswordToken: String,
  resetPasswordExpire: Date,
});
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
  return next();
});
userSchema.methods.getjwttoken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};
userSchema.methods.comparepassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};
userSchema.methods.getresetpasswordtoken = function () {
  const resettoken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resettoken)
    .digest("hex");
  this.resetPasswordExpire = Date.now() + 15 * 60 * 60 * 1000;
  return resettoken;
};
const usermodel = model("User", userSchema);

export default usermodel;
