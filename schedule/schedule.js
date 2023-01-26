const cron = require("node-cron");
const fs = require("fs");
const axios = require("axios");
const AdmZip = require("adm-zip");
const { Jobs } = require("../models/jobs");
const mongoose = require("mongoose");
const { XMLParser, XMLBuilder, XMLValidator } = require("fast-xml-parser");
const util = require("../helper/util/util");

const logger = require("../helper/logger");
const crypto = require("crypto");

const saveJobs = async (job = [], id) => {
  try {
    logger.log(id, "saveJobs", "Started", Date.now());

    await Jobs.deleteMany({})
      .then(function () {})
      .then(() => {
        Jobs.insertMany(job, function (err) {
          if (err) {
            logger.log(id, "saveJobs", "Error", Date.now(), err.message);
          } else {
            logger.log(id, "saveJobs", "Ended", Date.now());
          }
        });
      })
      .catch(function (error) {
        logger.log(id, "saveJobs", "Error", Date.now(), error.message);
      });
  } catch (err) {
    logger.log(id, "saveJobs", "Error", Date.now(), err.message);
  }
};

const testJobsSavingActivity = () => {
  try {
    const id = crypto.randomBytes(16).toString("hex");
    let isZipFileReceived = true;
    console.log("2nd then");
    if (isZipFileReceived) {
      if (util.checkZipFileExists()) {
        util.extractZipFile(id);

        if (util.checkXmlFileExists()) {
          saveJobs(util.convertToJson(), id);
        }
      }
    }
  } catch (err) {
    console.log("Errrror " + err);
  }
};
module.exports = () => {
  cron.schedule("0 0 */4 * * *", () => {
    //console.log("started");
    //testJobsSavingActivity();

    const id = crypto.randomBytes(16).toString("hex");
    const jobDir = process.env.Jobg8File;
    const fileUrl = process.env.JOBG8URL;
    if (!fs.existsSync(jobDir)) {
      fs.mkdirSync(jobDir, { recursive: true });
    }
    let zipPath = jobDir + "/jobs.zip";
    logger.log(id, "Cron_Job", "Started", Date.now());
    let isZipFileReceived = false;
    try {
      axios
        .get(fileUrl, {
          headers: {
            Accept: "application/zip",
          },
          responseType: "arraybuffer",
        })
        .then((response) => {
          if (response.headers["content-type"] === `application/zip`) {
            logger.log(id, "Zip Download", "Started", Date.now());
            return new Promise(function (resolve, reject) {
              fs.writeFile(zipPath, response.data, (err) => {
                if (err) {
                  reject(err);
                } else {
                  isZipFileReceived = true;
                  logger.log(id, "Zip Download", "Ended", Date.now());
                  resolve(response.data);
                }
              });
            });
          } else if (
            response.headers["content-type"] === `text/html; charset=utf-8`
          ) {
            isZipFileReceived = false;
          }
        })
        .then((response) => {
          if (isZipFileReceived) {
            if (util.checkZipFileExists()) {
              util.extractZipFile(id);
              if (util.checkXmlFileExists()) {
                saveJobs(util.convertToJson(), id);
              }
            }
          }
        })
        .catch((err) => {
          logger.log(id, "Cron_Job", "Error", Date.now(), err.message);
        });
    } catch (err) {
      logger.log(id, "Cron_Job", "Error", Date.now(), err.message.toString());
    }
  });
};
