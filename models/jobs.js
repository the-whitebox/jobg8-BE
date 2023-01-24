const mongoose = require("mongoose");

const jobSchema = mongoose.Schema({
  AdvertiserName: { type: String, required: true, maxLength: 100 },
  AdvertiserType: { type: String, required: true, maxLength: 100 },
  SenderReference: { type: String, required: true, maxLength: 30 },
  DisplayReference: { type: String, default: "", maxLength: 100 },
  Classification: { type: String, default: "", maxLength: 100 },
  SubClassification: { type: String, default: "", maxLength: 100 },
  Position: { type: String, default: "", maxLength: 255 },
  Description: { type: String, default: "" },
  Country: { type: String, default: "", maxLength: 100 },
  Location: { type: String, default: "", maxLength: 100 },
  Area: { type: String, default: "", maxLength: 100 },
  PostalCode: { type: String, default: "", maxLength: 20 },
  ApplicationURL: { type: String, default: "", maxLength: 255 },
  Language: { type: String, default: "", maxLength: 10 },
  EmploymentType: { type: String, default: "", maxLength: 70 },
  StartDate: { type: String, default: "", maxLength: 70 },
  Duration: { type: String, default: "", maxLength: 70 },
  WorkHours: { type: String, default: "", maxLength: 70 },
  SalaryCurrency: { type: String, default: "", maxLength: 70 },
  SalaryMinimum: { type: String, default: "", maxLength: 20 },
  SalaryMaximum: { type: String, default: "", maxLength: 20 },
  SalaryPeriod: { type: String, default: "", maxLength: 70 },
  SalaryAdditional: { type: String, default: "", maxLength: 70 },
  AdditionalClassification1: { type: String, default: "", maxLength: 100 },
  AdditionalClassification2: { type: String, default: "", maxLength: 100 },
  AdditionalClassification3: { type: String, default: "", maxLength: 100 },
  AdditionalClassification4: { type: String, default: "", maxLength: 100 },
  LogoURL: { type: String, default: "", maxLength: 255 },
  JobType: { type: String, default: "", maxLength: 20 },
  SellPrice: { type: String, default: "", maxLength: 20 },
  RevenueType: { type: String, default: "", maxLength: 20 },
});

jobSchema.virtual("id").get(function () {
  return this._id.toHexString();
});
jobSchema.set("toJSON", {
  virtuals: true,
});

exports.Jobs = mongoose.model("Jobs", jobSchema);
exports.jobSchema = jobSchema;
