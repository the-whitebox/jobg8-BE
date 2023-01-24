const express = require("express");
const { User } = require("../models/user");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const sendEmail = require("../helper/emailer");
const util = require("../helper/util/util");
const auth = require("../middleware/auth");
const crypto = require("crypto");

const logger = require("../helper/logger");

router.post("/register", async (req, res) => {
  try {
    let url = "Post /api/v1/users/register";
    const id = crypto.randomBytes(16).toString("hex");
    logger.log(id, url, "Started", Date.now());
    const oldUser = await User.findOne({ email: req.body.email });

    if (oldUser) {
      logger.log(
        id,
        url,
        "Ended",
        Date.now(),
        "User Already Exist. Please Login"
      );
      return res
        .status(400)
        .json({ success: false, message: "User Already Exist. Please Login" });
    }
    const { email, password } = req.body;

    if (!(email && password)) {
      logger.log(
        id,
        url,
        "Ended",
        Date.now(),
        "Email and Password is required !"
      );
      return res
        .status(400)
        .json({ success: false, message: "Email and Password is required !" });
    }

    let user = new User({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      passwordHash: bcrypt.hashSync(req.body.password, 10),
      phone: req.body.phone,
      street: req.body.street,
      zip: req.body.zip,
      city: req.body.city,
      country: req.body.country,
    });

    let user1 = await user.save();
    if (!user1) {
      logger.log(id, url, "Ended", Date.now(), "User cannot be Created !");

      return res
        .status(400)
        .json({ success: false, message: "User cannot be Created !" });
    }

    const token = jwt.sign(
      { userId: user1._id, email: user1.email },
      process.env.secret,
      {
        expiresIn: "2h",
      }
    );
    logger.log(id, url, "Ended", Date.now());
    return res.status(200).json({ id: user1.id, token: token });
  } catch (err) {
    logger.log(id, url, "Error", Date.now(), err);
    return res.status(500).json({ success: false, error: err });
  }
});

router.post("/login", async (req, res) => {
  try {
    const id = crypto.randomBytes(16).toString("hex");
    let url = "Post /api/v1/users/login";
    logger.log(id, url, "Started", Date.now());
    const { email, password } = req.body;
    if (!(email && password)) {
      logger.log(
        id,
        url,
        "Ended",
        Date.now(),
        "Email and Password is required !"
      );
      return res
        .status(400)
        .json({ success: false, message: "Email and Password is required !" });
    }

    const user = await User.findOne({ email });
    const secret = process.env.secret;
    if (!user) {
      logger.log(id, url, "Ended", Date.now(), "The user not found");
      return res
        .status(400)
        .json({ success: false, message: "The user not found" });
    }

    if (user && bcrypt.compareSync(password, user.passwordHash)) {
      const token = jwt.sign(
        {
          userId: user.id,
          email,
        },
        secret,
        { expiresIn: "1d" }
      );
      logger.log(id, url, "Ended", Date.now());
      return res.status(200).json({ user: user, token: token });
    } else {
      logger.log(id, url, "Ended", Date.now(), "Password is wrong!");
      return res
        .status(400)
        .json({ success: false, message: "Password is wrong!" });
    }
  } catch (err) {
    logger.log(id, url, "Error", Date.now(), err);
    return res.status(500).json({ success: false, error: err });
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const id = crypto.randomBytes(16).toString("hex");
    let url = "Get /api/v1/users/:id";
    logger.log(id, url, "Started", Date.now());

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res
        .status(400)
        .json({ success: false, message: "There is a wrong id that you sent" });
    }
    const user = await User.findById(req.params.id).select("-passwordHash");

    if (!user) {
      logger.log(id, url, "Ended", Date.now(), "The User not found !!!");
      return res.status(500).json({
        success: false,
        message: "The User not found !!!",
      });
    }
    logger.log(id, url, "Ended", Date.now());
    return res.status(200).json(user);
  } catch (err) {
    logger.log(id, url, "Error", Date.now(), err);
    return res.status(500).json({ success: false, error: err });
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const id = crypto.randomBytes(16).toString("hex");
    let url = "Put /api/v1/users/:id";
    logger.log(id, url, "Started", Date.now());
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Wrong Id" });
    }
    const userExist = await User.findById(req.params.id);
    let newPassword;
    if (req.body.password) {
      newPassword = bcrypt.hashSync(req.body.password, 10);
    } else {
      newPassword = userExist.passwordHash;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        passwordHash: newPassword,
        phone: req.body.phone,
        street: req.body.street,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
      },
      { new: true }
    );

    if (!user) {
      logger.log(id, url, "Ended", Date.now(), "The User not Updated!");
      return res
        .status(400)
        .json({ success: false, message: "The User not Updated!" });
    }
    logger.log(id, url, "Ended", Date.now());
    return res.status(200).json(user);
  } catch (err) {
    logger.log(id, url, "Error", Date.now(), err);
    return res.status(500).json({ success: false, error: err });
  }
});

router.post("/resetpassword", async (req, res) => {
  try {
    const id = crypto.randomBytes(16).toString("hex");
    let url = "Post /api/v1/users/resetpassword";
    logger.log(id, url, "Started", Date.now());
    const { email } = req.body;
    if (!email) {
      logger.log(id, url, "Ended", Date.now(), "Email is required!");
      return res
        .status(400)
        .json({ success: false, message: "Email is required!" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      logger.log(id, url, "Ended", Date.now(), "Invalid User");
      return res.status(400).json({ success: false, message: "Invalid User" });
    }

    let newPassword = Math.random().toString(36).slice(-8);
    let newPasswordHash = bcrypt.hashSync(newPassword, 10);

    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        passwordHash: newPasswordHash,
      },
      { new: true }
    ).select("-passwordHash");

    if (!updatedUser) {
      logger.log(id, url, "Ended", Date.now(), "Password not updated!");
      return res
        .status(400)
        .json({ success: false, message: "Password is not updated!" });
    } else {
      await util.sendForgotPasswordEmail(
        updatedUser.email,
        updatedUser.firstName,
        "Password reset",
        newPassword
      );
      logger.log(id, url, "Ended", Date.now());
      return res
        .status(200)
        .json({ success: true, message: "Email has been sent" });
    }
  } catch (err) {
    logger.log(id, url, "Error", Date.now(), err);
    return res.status(500).json({ success: false, error: err });
  }
});

router.get(`/`, auth, async (req, res) => {
  try {
    const id = crypto.randomBytes(16).toString("hex");
    let url = "Get /api/v1/users";
    logger.log(id, url, "Started", Date.now());
    const userList = await User.find().select("-passwordHash");

    if (!userList) {
      logger.log(id, url, "Ended", Date.now(), "No User Found");
      return res.status(500).json({ success: false, message: "No User Found" });
    } else {
      logger.log(id, url, "Ended", Date.now());
      return res.status(200).json(userList);
    }
  } catch (err) {
    logger.log(id, url, "Error", Date.now(), err);
    return res.status(500).json({ success: false, error: err });
  }
});

// router.delete("/:id", (req, res) => {
//   User.findByIdAndRemove(req.params.id)
//     .then((user) => {
//       if (user) {
//         return res
//           .status(200)
//           .json({ success: true, message: "the user is deleted!" });
//       } else {
//         return res
//           .status(404)
//           .json({ success: false, message: "user not found!" });
//       }
//     })
//     .catch((err) => {
//       return res.status(500).json({ success: false, error: err });
//     });
// });

// router.get(`/get/count`, async (req, res) => {
//   const product = await User.countDocuments();

//   if (!product) {
//     res.status(500).json({ success: false });
//   }
//   //res.send(product);
//   res.status(200).json({ count: product });
// });

// router.post("/", async (req, res) => {
//   let user = new User({
//     name: req.body.name,
//     email: req.body.email,
//     passwordHash: bcrypt.hashSync(req.body.password, 10),
//     phone: req.body.phone,
//     //isAdmin: req.body.isAdmin,
//     street: req.body.street,
//     //apartment: req.body.apartment,
//     zip: req.body.zip,
//     city: req.body.city,
//     country: req.body.country,
//   });
//   user = await user.save();

//   if (!user) return res.status(400).send("the user cannot be created!");

//   res.send(user);
// });

module.exports = router;
