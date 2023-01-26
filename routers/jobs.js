const express = require("express");
const { Jobs } = require("../models/jobs");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const auth = require("../middleware/auth");
const crypto = require("crypto");

const logger = require("../helper/logger");
const { error } = require("console");

router.post(`/`, async (req, res) => {
  try {
    let pageSize = 10,
      pageNumber = 1;
    if (req.body.pageSize && req.body.pageNumber) {
      pageSize = req.body.pageSize;
      pageNumber = req.body.pageNumber;
    }

    const jobList = await Jobs.find()
      .limit(pageSize)
      .skip(pageSize * (pageNumber - 1))
      .sort({
        AdvertiserName: "asc",
      });
    const jobCount = await Jobs.count();

    if (!jobList) {
      return res.status(500).json({ success: false, message: "No Job found" });
    } else {
      const pageInfo = {
        totalPages: Math.ceil(jobCount / pageSize),
        totalRecord: jobCount,
        pageNumber: pageNumber,
        pageSize: pageSize,
      };
      return res.status(200).json({
        jobList,
        pageInfo,
      });
    }
  } catch (err) {
    return res.status(500).json({ success: false, error: err });
  }
});

router.post(`/:id`, async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Wrong Job Id" });
    }
    const job = await Jobs.findById(req.params.id);

    if (!job) {
      return res
        .status(500)
        .json({ success: false, message: "The job not found" });
    } else {
      return res.status(200).json(job);
    }
  } catch (err) {
    res.status(500).json({ success: false, error: err });
  }
});

module.exports = router;
