const express = require("express");
const { validateBody } = require("../middlewares/validateBody");
const { createReviewSchema, updateReviewSchema } = require("../validators/review.validator");
const {
  listReviews,
  createReview,
  updateReview,
  deleteReview
} = require("../controllers/review.controller");

const router = express.Router();

router.get("/menu/:menuItemId", listReviews);
router.post("/menu/:menuItemId/add", validateBody(createReviewSchema), createReview);
router.patch("/menu/:menuItemId/update", validateBody(updateReviewSchema), updateReview);
router.delete("/menu/:menuItemId", deleteReview);

module.exports = router;
