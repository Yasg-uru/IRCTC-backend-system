import User from "../model/user.model.js";
import catchasyncerror from "../middleware/catchasynerror.middleware.js";
import Errorhandler from "../utils/Errorhandler.utils.js";
import sendtokenUtil from "../utils/sendtoken.util.js";
import sendmail from "../utils/sendmail.util.js"
import uploadcloudianry from "../utils/cloudinary.util.js"
export const createuser = catchasyncerror(async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    // const cloudinary=await uploadcloudianry(req.file.path);
    // const profile=cloudinary.secure_url;

    const user = await User.create({
      name,
      email,
      password,
      // profile
      
    });
    sendtokenUtil(200, res, user);
  } catch (error) {
    return next(new Errorhandler(error?.message, 500));
  }
});
export const login = catchasyncerror(async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log("this is a email and password:",email+"      "+password)
    if (!email || !password) {
      return next(new Errorhandler("please Enter correct Email or password"));
    }
    const user = await User.findOne({ email: email }).select("+password");
    if (!user) {
      return next(new Errorhandler("'please enter correct email or password"));
    }
    console.log("this is a user in login form :",user)
    const compare =  await user.comparepassword(password);
    if (!compare) {
      return next(new Errorhandler("please enter correct email or password"));
    }
    sendtokenUtil(200, res, user);
  } catch (error) {
    return next(new Errorhandler(error?.message, 500));
  }
});
export const logout = catchasyncerror(async (req, res, next) => {
  await res.cookie("token", null, {
    expires: new Date(0),
    httpOnly: true,
  });
  res.status(200).json({
    success: true,
    message: "logout successfully",
  });
});
export const getdetail=catchasyncerror(async (req,res,next)=>{
  const user=User.findById(req.user._id);
  if(!user){
      return next(new Errorhandler("user not found",404));

  }
  res.status(200).json({
      success:true,
      user
  })
})

export const forgotpassword = catchasyncerror(async (req, res, next) => {
console.log("this is a email:",req.body.email)
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new Errorhandler("user not found", 404));
  }
  const token =await user.getresetpasswordtoken();
  await user.save({ validateBeforeSave: false });

  const resetPassword = `${req.protocol}://${req.get(
    "host"
  )}/getnotes/password/reset/${token}`;
  console.log(resetPassword);

  const message = `Your password reset token is:\n\n${resetPassword}\n\nIf you have not requested this email, please ignore it.`;
  try {
    await sendmail({
      email: user.email,
      subject: "getnotes password recovery",
      message: message,
    });
    res.status(200).json({
      success: true,
      message: "email sent",
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new Errorhandler(error.message, 500));
  }
});

 export const resetpassword = catchasyncerror(async (req, res, next) => {
  // now we have resetpassword token and their time
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(new Errorhandler("user not found", 404));
  }
  if (req.body.password !== req.body.confirmpassword) {
    return next(new Errorhandler("password not match", 404));
  } else {
    user.password = req.body.password;
    user.resetPasswordExpire = undefined;
    user.resetPasswordToken = undefined;
    await user.save();
  }
  sendToken(res, user, 200);
});
export const updatepassword = catchasyncerror(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");
  if (!user) {
    return next(new Errorhandler("user not found", 404));
  }
  const ispasswordmatched = await user.comparepassword(req.body.oldpassword);
  if (!ispasswordmatched) {
    return next(new Errorhandler("oldpassword is incorrect", 404));
  }
  if (req.body.newpassword !== req.body.confirmpassword) {
    return next(new Errorhandler("please enter correct password"));
  }
  user.password = req.body.newpassword;
  await user.save();
  sendToken(res, user, 200);
});

//creating admin pannel for updating particular user role and get allusers and getsingleuser,and deleting user with their id
export const getalluser = catchasyncerror(async (req, res, next) => {
  const user = await User.find({});
  if (!user) {
    return next(new Errorhandler("user not found", 404));
  }
  res.status(200).json({
    success: true,
    user: user,
  });
});

//get single user with id
export const getsingleuser = catchasyncerror(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new Errorhandler("user not found", 404));
  }
  res.status(200).json({
    success: true,
    user,
  });
});
//update user profile
export const updateuserprofile = catchasyncerror(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  const newuser = {
    name: req.body.name,
    email: req.body.email,
  };
  if (!user) {
    return next(new Errorhandler("user not found"));
  }
  const updateduser = await User.findByIdAndUpdate(req.params.id, newuser, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  res.status(200).json({
    success: true,
    updateduser,
  });
});

//update particular user
export const updateuserrole = catchasyncerror(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  console.log("update role is called"+req.body.role)
  const newuser = {
    role: req.body.role,
  };
  if (!user) {
    return next(new Errorhandler("user not found"));
  }
  const updateduser = await User.findByIdAndUpdate(req.params.id, newuser, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });
  res.status(200).json({
    success: true,
    updateduser,
  });
});

export const deleteuser = catchasyncerror(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new Errorhandler("user not found", 404));
  }
  await User.findByIdAndDelete(req.body.id);
  res.status(200).json({
    success: true,
    message: "deleted user successfully",
  });
});

