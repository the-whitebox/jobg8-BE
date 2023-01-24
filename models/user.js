const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String, required: true },
  passwordHash: { type: String, required: true },
  phone: { type: String },
  street: { type: String, default: "" },
  zip: { type: String, default: "" },
  city: { type: String, default: "" },
  country: { type: String, default: "" },
});

userSchema.virtual("id").get(function () {
  return this._id.toHexString();
});
userSchema.set("toJSON", {
  virtuals: true,
});

exports.User = mongoose.model("User", userSchema);
exports.userSchema = userSchema;
