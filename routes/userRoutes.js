const express = require("express");
const userController = require("../controllers/userController");
const authController = require("../controllers/authController");




const userRouter = express.Router();


userRouter.post("/signup", authController.signup);
userRouter.post("/login", authController.login);
userRouter.get("/logout", authController.logout);
userRouter.post("/forgotPassword", authController.forgotPassword);
userRouter.patch("/resetPassword/:token", authController.resetPassword);

// user protect middleware here for all the routes below. Because middleware runs line to line, so to access below this middleware runs first & also check for authentication..
userRouter.use(authController.protect);

userRouter.patch("/updateMyPassword", authController.updatePassword);

userRouter.get('/me', userController.getMe, userController.getUser);
userRouter.patch('/updateMe', userController.uploadUserPhoto, userController.resizeUserPhoto, userController.updateMe);
userRouter.delete('/deleteMe', userController.deleteMe);

// Only admin have the permission to access below routes..
userRouter.use(authController.restrictTo('admin'));


userRouter
  .route("/")
  .get(userController.getAllUsers);

userRouter
  .route("/:id")
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);


module.exports = userRouter;
