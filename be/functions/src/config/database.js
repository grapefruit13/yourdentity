const admin = require('firebase-admin');
const {FieldValue} = require("firebase-admin/firestore");

try {
  require("dotenv").config();
} catch (_) {
  // dotenv not available
}

if (!admin.apps || admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();

module.exports = {
  admin,
  db,
  FieldValue
};