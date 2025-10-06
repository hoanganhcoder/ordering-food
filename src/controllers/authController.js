const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const User = require("../models/User");
const Session = require("../models/Session");
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require("../utils/jwt");

const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");

exports.register = async (req, res) => {
    try {
        const { email, phone, password, name } = req.body;

        const existing = await User.findOne({ $or: [{ email }, { phone }] });
        if (existing) return res.status(400).json({ message: "Email or phone already exists" });

        const hashed = await bcrypt.hash(password, 10);
        const user = await User.create({
            email,
            phone,
            password: hashed,
            name,
            roles: ["customer"]
        });

        res.json({
            message: "User registered successfully",
            user: { id: user._id, email: user.email, phone: user.phone, roles: user.roles }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, phone, password } = req.body;

        const user = await User.findOne(email ? { email } : { phone });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });

        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(400).json({ message: "Invalid credentials" });

        const payload = { id: user._id, email: user.email, phone: user.phone, roles: user.roles };
        const accessToken = signAccessToken(payload);
        const refreshToken = signRefreshToken({ sid: crypto.randomUUID(), ...payload });

        const { exp } = verifyRefreshToken(refreshToken);
        await Session.create({
            user_id: user._id,
            refresh_token_hash: hashToken(refreshToken),
            ip: req.ip,
            ua: req.headers["user-agent"],
            expires_at: new Date(exp * 1000)
        });

        res.json({
            access_token: accessToken,
            refresh_token: refreshToken,
            user: { id: user._id, email: user.email, phone: user.phone, roles: user.roles }
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.refresh = async (req, res) => {
    try {
        const { refresh_token } = req.body;
        if (!refresh_token) return res.status(400).json({ message: "Missing refresh_token" });

        const decoded = verifyRefreshToken(refresh_token);
        const tokenHash = hashToken(refresh_token);

        const session = await Session.findOne({
            user_id: decoded.id,
            refresh_token_hash: tokenHash,
            is_revoked: false,
            expires_at: { $gt: new Date() }
        });

        if (!session) return res.status(401).json({ message: "Invalid refresh token" });

        session.is_revoked = true;
        await session.save();

        const payload = { id: decoded.id, email: decoded.email, phone: decoded.phone, roles: decoded.roles };
        const newAccess = signAccessToken(payload);
        const newRefresh = signRefreshToken({ sid: crypto.randomUUID(), ...payload });
        const { exp } = verifyRefreshToken(newRefresh);

        await Session.create({
            user_id: decoded.id,
            refresh_token_hash: hashToken(newRefresh),
            ip: req.ip,
            ua: req.headers["user-agent"],
            expires_at: new Date(exp * 1000)
        });

        res.json({ access_token: newAccess, refresh_token: newRefresh });
    } catch (err) {
        res.status(401).json({ message: "Invalid/expired refresh token" });
    }
};

exports.logout = async (req, res) => {
    try {
        const { refresh_token } = req.body;
        if (!refresh_token) return res.status(400).json({ message: "Missing refresh_token" });

        await Session.updateOne(
            { refresh_token_hash: hashToken(refresh_token) },
            { $set: { is_revoked: true } }
        );

        res.json({ message: "Logged out" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getMe = async (req, res) => {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
};

exports.adminOnly = async (req, res) => {
    res.json({ message: "Welcome Admin!", user: req.user });
};
