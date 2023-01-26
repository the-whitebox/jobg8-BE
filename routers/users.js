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
    const oldUser = await User.findOne({ email: req.body.email });

    if (oldUser) {
      return res
        .status(400)
        .json({ success: false, message: "User Already Exist. Please Login" });
    }
    const { email, password } = req.body;

    if (!(email && password)) {
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
    return res.status(200).json({ id: user1.id, token: token });
  } catch (err) {
    return res.status(500).json({ success: false, error: err });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!(email && password)) {
      return res
        .status(400)
        .json({ success: false, message: "Email and Password is required !" });
    }

    const user = await User.findOne({ email });
    const secret = process.env.secret;
    if (!user) {
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
      return res.status(200).json({ user: user, token: token });
    } else {
      return res
        .status(400)
        .json({ success: false, message: "Password is wrong!" });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err });
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res
        .status(400)
        .json({ success: false, message: "There is a wrong id that you sent" });
    }
    const user = await User.findById(req.params.id).select("-passwordHash");

    if (!user) {
      return res.status(500).json({
        success: false,
        message: "The User not found !!!",
      });
    }
    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json({ success: false, error: err });
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
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
      return res
        .status(400)
        .json({ success: false, message: "The User not Updated!" });
    }

    return res.status(200).json(user);
  } catch (err) {
    return res.status(500).json({ success: false, error: err });
  }
});

router.post("/resetpassword", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required!" });
    }

    const user = await User.findOne({ email });

    if (!user) {
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
      return res
        .status(200)
        .json({ success: true, message: "Email has been sent" });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err });
  }
});

router.get(`/`, auth, async (req, res) => {
  try {
    const userList = await User.find().select("-passwordHash");

    if (!userList) {
      return res.status(500).json({ success: false, message: "No User Found" });
    } else {
      return res.status(200).json(userList);
    }
  } catch (err) {
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
