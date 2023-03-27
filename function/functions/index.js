const functions = require("firebase-functions");
const admin = require("firebase-admin")
admin.initializeApp();

const { sendMessage } = require('./queue')

exports.addInpaintJob = functions.firestore
    .document('jobs/{docId}')
    .onCreate(async (change, context) => {
        await sendMessage(context.params.docId)
        console.log(`${context.params.docId} has been sent`)
    });
