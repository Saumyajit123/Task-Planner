const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User Id is required"],
    },

    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    description: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

CategorySchema.index(
  {
    userId: 1,
    name: 1,
  },
  {
    unique: true,
  },
);

const CategoryModel = mongoose.model("Category", CategorySchema);

module.exports = CategoryModel;
