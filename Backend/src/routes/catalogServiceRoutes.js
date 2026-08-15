const express = require("express");
const router = express.Router();
const requireAuth = require("../middleware/requireAuth");
const requireAdmin = require("../middleware/requireAdmin");
const {
    getCatalogServices,
    getCatalogServiceById,
    getCatalogServiceProviders,
    createCatalogService,
    updateCatalogService,
} = require("../controllers/catalogServiceController");

// Public routes
router.get("/", getCatalogServices);
router.get("/:id", getCatalogServiceById);
router.get("/:id/providers", getCatalogServiceProviders);

// Admin routes
router.post("/", requireAuth, requireAdmin, createCatalogService);
router.patch("/:id", requireAuth, requireAdmin, updateCatalogService);

module.exports = router;
