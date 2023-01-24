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
    let url = "Get /api/v1/jobs";

    const id = crypto.randomBytes(16).toString("hex");

    logger.log(id, url, "Started", Date.now());
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
      logger.log(id, url, "Ended", Date.now(), "No Job found");
      return res.status(500).json({ success: false, message: "No Job found" });
    } else {
      logger.log(id, url, "Ended", Date.now());

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
    logger.log(id, url, "Error", Date.now(), err);
    return res.status(500).json({ success: false, error: err });
  }
});

router.post(`/:id`, async (req, res) => {
  let url = "Get /api/v1/jobs/:id";
  const id = crypto.randomBytes(16).toString("hex");
  logger.log(id, url, "Started", Date.now());
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Wrong Job Id" });
    }
    const job = await Jobs.findById(req.params.id);

    if (!job) {
      logger.log(id, url, "Ended", Date.now(), "The job not found");
      return res
        .status(500)
        .json({ success: false, message: "The job not found" });
    } else {
      logger.log(id, url, "Ended", Date.now());
      return res.status(200).json(job);
    }
  } catch (err) {
    logger.log(id, url, "Error", Date.now(), err);
    res.status(500).json({ success: false, error: err });
  }
});

module.exports = router;
