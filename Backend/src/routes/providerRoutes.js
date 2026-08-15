const express = require('express');
const { apply, getAllProviders, getProviderById } = require('../controllers/providerController');
const requireAuth = require('../middleware/requireAuth');

const router = express.Router();

router.get('/', getAllProviders);
router.get('/:id', getProviderById);

router.post('/apply', requireAuth, apply);

module.exports = router;