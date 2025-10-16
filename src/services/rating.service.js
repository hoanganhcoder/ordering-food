const mongoose = require("mongoose");
const Review = require("../models/Review");
const MenuItem = require("../models/MenuItem");

async function recomputeMenuItemRating(menuItemId) {
  try {
    const objectId = new mongoose.Types.ObjectId(String(menuItemId));

    const agg = await Review.aggregate([
      { $match: { menuItemId: objectId } },
      {
        $group: {
          _id: "$menuItemId",
          avg: { $avg: "$rating" },
          count: { $sum: 1 }
        }
      }
    ]);

    const avg = agg.length ? Number(agg[0].avg.toFixed(2)) : 0;
    const count = agg.length ? agg[0].count : 0;

    await MenuItem.findByIdAndUpdate(
      objectId,
      { $set: { rate: avg, rateCount: count } },
      { new: true }
    );

    console.log(`✅ Updated rating for MenuItem ${menuItemId}: ${avg} (${count} reviews)`);
  } catch (err) {
    console.error("❌ recomputeMenuItemRating error:", err.message);
  }
}

module.exports = { recomputeMenuItemRating };