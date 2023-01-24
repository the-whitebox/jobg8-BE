const express = require("express");
const morgan = require("morgan");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const cron = require("node-cron");

require("dotenv/config");
require("./schedule/schedule")();

app.use(cors());
app.options("*", cors());

const swaggerUi = require("swagger-ui-express"),
  swaggerDocument = require("./swagger.json");
//MiddleWare
app.use(express.json());
app.use(morgan("tiny"));

app.use((req, res, next) => {
  const start = Date.now();
  console.log(`${req.method} ${req.url}`);
  next();
  // response actions goes here
  const delta = Date.now() - start;

  console.log(`${delta}ms is the time difference`);
});

//Routes
const usersRouter = require("./routers/users");
const jobsRouter = require("./routers/jobs");
const api = process.env.API_URL;
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(`${api}/users`, usersRouter);
app.use(`${api}/jobs`, jobsRouter);

mongoose
  .connect(process.env.CONNECTION_STRING, {
    connectTimeoutMS: 600000,
  })
  .then(() => {
    console.log("Data Base connection is ready");
  })
  .catch((err) => {
    throw err;
  });

app.listen(3000, () => {
  console.log("Server is listening at 3000");
});
