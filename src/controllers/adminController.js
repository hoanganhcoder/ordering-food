const User = require("../models/User");
const Order = require("../models/Order");
const Payment = require("../models/Payment");
const Dish = require("../models/Dish");
const Review = require("../models/Review");

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const { status, role, page = 1, limit = 20, search } = req.query;
    const filter = {};

    if (status) filter.status = status;
    if (role) filter.roles = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } }
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("-password")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      User.countDocuments(filter)
    ]);

    res.json({
      success: true,
      data: users,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update user status
exports.updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Update user roles
exports.updateUserRoles = async (req, res) => {
  try {
    const { roles } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { roles },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Get revenue reports
exports.getRevenueReports = async (req, res) => {
  try {
    const { startDate, endDate, groupBy = "day" } = req.query;

    const matchFilter = {
      status: "completed",
      paymentStatus: "paid"
    };

    if (startDate || endDate) {
      matchFilter.completedAt = {};
      if (startDate) matchFilter.completedAt.$gte = new Date(startDate);
      if (endDate) matchFilter.completedAt.$lte = new Date(endDate);
    }

    // Aggregate revenue data
    const revenueData = await Order.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: {
            $dateToString: {
              format: groupBy === "month" ? "%Y-%m" : "%Y-%m-%d",
              date: "$completedAt"
            }
          },
          totalRevenue: { $sum: "$totalAmount" },
          orderCount: { $sum: 1 },
          averageOrderValue: { $avg: "$totalAmount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Calculate totals
    const totalRevenue = revenueData.reduce((sum, day) => sum + day.totalRevenue, 0);
    const totalOrders = revenueData.reduce((sum, day) => sum + day.orderCount, 0);

    res.json({
      success: true,
      data: {
        summary: {
          totalRevenue,
          totalOrders,
          averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0
        },
        breakdown: revenueData
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get order statistics
exports.getOrderStatistics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const matchFilter = {};
    if (startDate || endDate) {
      matchFilter.createdAt = {};
      if (startDate) matchFilter.createdAt.$gte = new Date(startDate);
      if (endDate) matchFilter.createdAt.$lte = new Date(endDate);
    }

    // Get order status distribution
    const statusDistribution = await Order.aggregate([
      { $match: matchFilter },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    // Get payment method distribution
    const paymentMethodDistribution = await Order.aggregate([
      { $match: { ...matchFilter, paymentStatus: "paid" } },
      { $group: { _id: "$paymentMethod", count: { $sum: 1 }, total: { $sum: "$totalAmount" } } }
    ]);

    // Get top selling dishes
    const topDishes = await Order.aggregate([
      { $match: { ...matchFilter, status: "completed" } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.dish",
          name: { $first: "$items.name" },
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 }
    ]);

    // Get customer statistics
    const customerStats = await Order.aggregate([
      { $match: matchFilter },
      { $group: { _id: "$user", orderCount: { $sum: 1 }, totalSpent: { $sum: "$totalAmount" } } },
      { $group: { _id: null, totalCustomers: { $sum: 1 }, avgOrdersPerCustomer: { $avg: "$orderCount" } } }
    ]);

    res.json({
      success: true,
      data: {
        statusDistribution,
        paymentMethodDistribution,
        topDishes,
        customerStats: customerStats[0] || { totalCustomers: 0, avgOrdersPerCustomer: 0 }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get dashboard overview
exports.getDashboardOverview = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      totalDishes,
      totalOrders,
      todayOrders,
      totalRevenue,
      pendingOrders,
      averageRating
    ] = await Promise.all([
      User.countDocuments(),
      Dish.countDocuments(),
      Order.countDocuments(),
      Order.countDocuments({ createdAt: { $gte: today } }),
      Order.aggregate([
        { $match: { status: "completed", paymentStatus: "paid" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } }
      ]),
      Order.countDocuments({ status: { $in: ["pending", "confirmed", "preparing"] } }),
      Review.aggregate([
        { $group: { _id: null, avgRating: { $avg: "$rating" } } }
      ])
    ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalDishes,
        totalOrders,
        todayOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        pendingOrders,
        averageRating: averageRating[0]?.avgRating || 0
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
