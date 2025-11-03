
const admin = require("firebase-admin");
// var serviceAccount = require("./serviceAccountKey.json");
const path = require("path");
require("dotenv").config();
const serviceAccountBuffer = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, "base64");
const serviceAccount = JSON.parse(serviceAccountBuffer.toString());


if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

exports.sendNotification = async (data) => {

  try {
    // Check if FCM token is present
    if (!data?.fcmToken) {
      console.warn("FCM token missing — notification not sent.");
      return notificationCreated;
    }
    // Prepare FCM message
    const message = {
      notification: {
        title: data?.title || "Default Title",
        body: data?.subTitle || "Default Body",
        image: data?.icon || null,
      },
      token: data.fcmToken,
    };
    // Send notification via Firebase
    const response = await admin.messaging().send(message);
    console.log("Notification sent successfully:", response);

    
  } catch (error) {
    
    // If token invalid or unregistered — handle & remove token from DB if you store it
    if (error.errorInfo?.code === "messaging/registration-token-not-registered") {
      console.warn("❌ Invalid/expired FCM token — should delete from DB if stored.");
      // Example: await User.updateOne({ fcmToken: data.fcmToken }, { $unset: { fcmToken: "" } });
    } else {
      console.error("❌ Error sending notification:", error);
    }
  }
};