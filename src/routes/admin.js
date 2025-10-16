const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth");
const adminController = require("../controllers/adminController");

// User management
router.get("/users", auth(["admin"]), adminController.getAllUsers);
router.put("/users/:id/status", auth(["admin"]), adminController.updateUserStatus);
router.put("/users/:id/roles", auth(["admin"]), adminController.updateUserRoles);

// Reports and statistics
router.get("/reports/revenue", auth(["admin"]), adminController.getRevenueReports);
router.get("/reports/orders", auth(["admin"]), adminController.getOrderStatistics);
router.get("/dashboard", auth(["admin"]), adminController.getDashboardOverview);

module.exports = router;
