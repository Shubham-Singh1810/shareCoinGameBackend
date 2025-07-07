const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");
const { type } = require("os");

const supportSchema = mongoose.Schema({
  PrivacyPolicy: {
    type: String,
  },
  TermsAndCondition: {
    type: String,
  },
});
supportSchema.plugin(timestamps);
module.exports = mongoose.model("Support", supportSchema);
