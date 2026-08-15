const express = require('express');
const router = express.Router();
const requireAuth = require('../middleware/requireAuth');
const { initiatePayment, verifyPayment, releasePayment } = require('../controllers/paymentController');

router.post('/initiate', requireAuth, initiatePayment);
router.post('/verify', requireAuth, verifyPayment); // can also be public if webhook, but for now we expect client to call it
router.post('/release/:bookingId', requireAuth, releasePayment);

module.exports = router;
