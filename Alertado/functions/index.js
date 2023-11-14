const functions = require("firebase-functions");
const admin = require("firebase-admin");
const db = admin.firestore();
admin.initializeApp();
const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Define the getPoliceTokens function (fetch tokens from your database)
const getPoliceTokens = async () => {
    try {
      // Fetch user documents where the "role" field is "Police"
      const snapshot = await db.collection("Users").where("role", "==", "Police").get();
  
      if (snapshot.empty) {
        console.log("No police users found in the database.");
        return [];
      }
  
      // Extract the registration tokens from the user documents
      const tokens = snapshot.docs.map((doc) => doc.data().registrationToken);
      return tokens;
    } catch (error) {
      console.error("Error fetching police tokens:", error);
      return [];
    }
  };

const sendEmergencyNotification = async (emergencyData) => {
  // Define the notification payload
  const payload = {
    notification: {
      title: "New Emergency",
      body: `A new emergency has been reported: ${emergencyData.type}`,
    },
  };

  // Get the registration tokens for police users
  const policeTokens = await getPoliceTokens(); // Implement this function.

  // Send the notifications
  await admin.messaging().sendToDevice(policeTokens, payload);
};

// Listen for changes in the Emergencies collection
exports.sendEmergencyNotificationOnCreate = functions.firestore
  .document("Emergencies/{emergencyId}")
  .onCreate((snap, context) => {
    const emergencyData = snap.data();
    return sendEmergencyNotification(emergencyData);
  });