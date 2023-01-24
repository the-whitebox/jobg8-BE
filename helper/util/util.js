const cron = require("node-cron");
const fs = require("fs");
const axios = require("axios");
const AdmZip = require("adm-zip");
const { Jobs } = require("../../models/jobs");
const mongoose = require("mongoose");
const { XMLParser, XMLBuilder, XMLValidator } = require("fast-xml-parser");
const logger = require("../logger");
const sendEmail = require("../emailer");
const emailTemp = require("./forgotpassword");

const convertToJson = () => {
  const parser = new XMLParser();

  let path = `${process.env.Jobg8File}/Jobs.xml`;

  try {
    const xml = require("fs").readFileSync(path, {
      encoding: "utf8",
      flag: "r",
    });

    let jsonData = parser.parse(xml);

    //------------------Need to remove---------------
    fs.writeFile(
      `${process.env.Jobg8File}/jsonCompleteJobs.txt`,
      JSON.stringify(jsonData.Jobs),
      (err) => {
        if (err) console.log(err);
        else console.log("Text Complete");
      }
    );

    return jsonData.Jobs.Job;
  } catch (err) {
    throw err;
  }
};

const checkZipFileExists = () => {
  try {
    let path = `${process.env.Jobg8File}/Jobs.zip`;

    if (fs.existsSync(path)) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    throw err;
  }
};

const checkXmlFileExists = () => {
  try {
    let path = `${process.env.Jobg8File}/Jobs.xml`;

    if (fs.existsSync(path)) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    throw err;
  }
};

const extractZipFile = (id) => {
  const path = `${process.env.Jobg8File}/Jobs.zip`;
  const extPath = process.env.Jobg8File;

  try {
    const zip = new AdmZip(path);

    logger.log(id, "extractZipFile", "Started", Date.now());

    zip.extractAllTo(extPath, true);

    logger.log(id, "extractZipFile", "Ended", Date.now());
  } catch (err) {
    logger.log(id, "extractZipFile", "Error", Date.now(), err.message);
    throw err;
  }
};
const sendForgotPasswordEmail = async (email, name, subject, newPassword) => {
  try {
    await sendEmail(email, subject, name, newPassword);
  } catch (err) {
    throw err;
  }
};

module.exports = {
  checkZipFileExists,
  convertToJson,
  extractZipFile,
  checkXmlFileExists,
  sendForgotPasswordEmail,
};
