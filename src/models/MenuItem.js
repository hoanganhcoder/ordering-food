const mongoose = require("mongoose");

const NutrientSchema = new mongoose.Schema({
    name: { type: String, required: true }, // ví dụ: Calories, Protein
    value: { type: Number, required: true },
    unit: { type: String, default: "" }    // ví dụ: kcal, g
}, { _id: false });

const MenuItemSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },

    thumbnail: { type: String, required: true },
    images: [{ type: String, default: [] }],
    tags: [{ type: String, default: [] }],
    type: { type: String, required: true },

    isAvailable: { type: Boolean, default: true },



    preparationTime: { type: String, default: "" },
    portion: { type: String, default: "" },


    ingredients: [{ type: String, default: [] }],
    nutritionalInformation: { type: [NutrientSchema], default: [] },


    rate: { type: Number, default: 0, min: 0, max: 5 },
    rateCount: { type: Number, default: 0, min: 0 },


    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, default: null, min: 0 },
    discountStartAt: { type: Date, default: null },
    discountEndAt: { type: Date, default: null }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

MenuItemSchema.pre("validate", function (next) {
    if (this.discountPrice != null && this.price != null) {
        if (this.discountPrice > this.price) {
            return next(new Error("discountPrice phải nhỏ hơn hoặc bằng price"));
        }
    }
    if (this.discountStartAt && this.discountEndAt) {
        if (this.discountStartAt > this.discountEndAt) {
            return next(new Error("discountStartAt phải trước hoặc bằng discountEndAt"));
        }
    }
    next();
});


MenuItemSchema.virtual("isDiscountActive").get(function () {
    const now = new Date();
    const hasPrice = this.discountPrice != null && this.discountPrice >= 0;
    const inWindow =
        (!this.discountStartAt || this.discountStartAt <= now) &&
        (!this.discountEndAt || this.discountEndAt >= now);
    return Boolean(hasPrice && inWindow);
});

MenuItemSchema.virtual("finalPrice").get(function () {
    return this.isDiscountActive ? this.discountPrice : this.price;
});

const MenuItem = mongoose.model("MenuItem", MenuItemSchema);
module.exports = MenuItem;