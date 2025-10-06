const express = require("express");
const auth = require("../middlewares/auth");
const {
  register,
  login,
  refresh,
  logout,
  getMe,
  adminOnly
} = require("../controllers/authController");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", auth(), getMe);
router.get("/admin", auth(["admin"]), adminOnly);

module.exports = router;
