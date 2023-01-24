const mongoose = require("mongoose");

const logSchema = mongoose.Schema({
  requestId: { type: String },
  methodName: { type: String },
  status: { type: String },
  message: { type: String },
  requestTime: { type: Date },
});

logSchema.virtual("id").get(function () {
  return this._id.toHexString();
});
logSchema.set("toJSON", {
  virtuals: true,
});

exports.Logs = mongoose.model("Logs", logSchema);
exports.logSchema = logSchema;
