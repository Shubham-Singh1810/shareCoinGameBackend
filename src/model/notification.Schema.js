const mongoose = require("mongoose");
const timestamps = require("mongoose-timestamp");
const { type } = require("os");

const notificationSchema = mongoose.Schema({
  icon: {
    type: String,
  },
  title: {
    type: String,
  },
  subTitle: {
    type: String,
  },
  gameId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Game",
  },
});

notificationSchema.plugin(timestamps);
module.exports = mongoose.model("Notification", notificationSchema);
