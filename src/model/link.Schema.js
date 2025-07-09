const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");
const { type } = require("os");

const linkSchema = mongoose.Schema({
  title: {
    type: String,
  },
  url: {
    type: String,
  },
  iosViewCount: {
    type: Number,
    default: 0,
  },
  androidViewCount: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    default: "active",
    enum: ["active", "inactive"]
  },
  gameId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Game",
  },
  referalCode: {
    type: String,
  },
  userId:[
   {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
   }
  ]
});
linkSchema.plugin(timestamps);
module.exports = mongoose.model("Link", linkSchema);