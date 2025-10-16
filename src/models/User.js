const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true, unique: true, trim: true },  // 🔹 thêm
  password: { type: String, required: true },
  name: { type: String, required: true },
  roles: { type: [String], default: ["customer"] },  // ["customer"], ["admin"]
  status: { type: String, enum: ["active", "blocked"], default: "active" }
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);


