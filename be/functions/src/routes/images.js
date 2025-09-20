const express = require('express');
const imageController = require('../controllers/imageController');

const router = express.Router();

router.post('/upload-image', imageController.uploadImage);
router.put('/users/:userId/profile-image', imageController.updateProfileImage);

module.exports = router;