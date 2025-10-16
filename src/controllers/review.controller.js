const mongoose = require("mongoose");
const Review = require("../models/Review");
const MenuItem = require("../models/MenuItem");
const User = require("../models/User");

async function recomputeMenuItemRating(menuItemId) {
  const agg = await Review.aggregate([
    { $match: { menuItemId: new mongoose.Types.ObjectId(menuItemId) } },
    { $group: { _id: "$menuItemId", avg: { $avg: "$rating" }, count: { $sum: 1 } } }
  ]);

  const avg = agg.length ? Number(agg[0].avg.toFixed(2)) : 0;
  const count = agg.length ? agg[0].count : 0;
  await MenuItem.findByIdAndUpdate(menuItemId, { $set: { rate: avg, rateCount: count } });
}

async function listReviews(req, res) {
  try {
    const { menuItemId } = req.params;
    if (!mongoose.isValidObjectId(menuItemId))
      return res.status(400).json({ message: "menuItemId không hợp lệ" });

    const reviews = await Review.find({ menuItemId })
      .populate("userId", "name email phone")
      .sort({ createdAt: -1 });

    res.json({ total: reviews.length, data: reviews });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

async function createReview(req, res) {
  try {
    const { menuItemId } = req.params;
    if (!mongoose.isValidObjectId(menuItemId))
      return res.status(400).json({ message: "menuItemId không hợp lệ" });

    const { userId, rating, comment, images } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User không tồn tại" });

    let review = await Review.findOne({ menuItemId, userId });
    if (review) {
      review.rating = rating;
      review.comment = comment;
      review.images = images || [];
      await review.save();
    } else {
      review = await Review.create({ menuItemId, userId, rating, comment, images });
    }

    await recomputeMenuItemRating(menuItemId);
    res.status(201).json({ message: "Đánh giá thành công", data: review });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
}

async function updateReview(req, res) {
  try {
    const { menuItemId } = req.params;
    if (!mongoose.isValidObjectId(menuItemId))
      return res.status(400).json({ message: "menuItemId không hợp lệ" });

    const review = await Review.findOne({ menuItemId, userId: req.user.id });
    if (!review) return res.status(404).json({ message: "Không tìm thấy review" });

    Object.assign(review, req.body);
    await review.save();
    await recomputeMenuItemRating(review.menuItemId);

    res.json({ message: "Cập nhật review thành công", data: review });
  } catch (err) {
    console.error(err);
    res.status(400).json({ message: err.message });
  }
}

async function deleteReview(req, res) {
  try {
    const { menuItemId } = req.params;
    if (!mongoose.isValidObjectId(menuItemId))
      return res.status(400).json({ message: "menuItemId không hợp lệ" });

    const doc = await Review.findOneAndDelete({ menuItemId, userId: req.user.id });
    if (!doc) return res.status(404).json({ message: "Không tìm thấy review" });

    await recomputeMenuItemRating(doc.menuItemId);
    res.json({ message: "Đã xoá review", data: doc._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
}

module.exports = {
  listReviews,
  createReview,
  updateReview,
  deleteReview
};
