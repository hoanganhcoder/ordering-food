const { z } = require("zod");

const createReviewSchema = z.object({
  userId: z.string().min(1, "userId là bắt buộc"),
  rating: z.number().min(0).max(5),
  comment: z.string().optional().default(""),
  images: z.array(z.string()).optional().default([])
});

const updateReviewSchema = z.object({
  rating: z.number().min(0).max(5).optional(),
  comment: z.string().optional(),
  images: z.array(z.string()).optional()
});

module.exports = {
  createReviewSchema,
  updateReviewSchema
};
