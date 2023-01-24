const mongoose = require("mongoose");
const { Logs } = require("../models/log");

const log = async (reqId, mName, status, rTime, msg = "") => {
  try {
    let log = new Logs({
      requestId: reqId,
      methodName: mName,
      status: status,
      requestTime: rTime,
      message: msg,
    });

    let log2 = await log.save();
  } catch (err) {
    throw err;
  }
};

module.exports = {
  log,
};
