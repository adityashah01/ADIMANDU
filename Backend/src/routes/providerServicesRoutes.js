const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const { getMyServices, addService, updateService, removeService } = require("../controllers/providerServiceController");

router.use(requireAuth);

router.get("/", getMyServices);
router.post("/", addService);
router.patch("/:id", updateService);
router.delete("/:id", removeService);

module.exports = router;
