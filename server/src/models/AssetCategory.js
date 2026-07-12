const mongoose = require('mongoose');

const customFieldSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      required: true,
      trim: true,
    },
    fieldType: {
      type: String,
      enum: ['text', 'number', 'date'],
      required: true,
    },
  },
  { _id: false }
);

const assetCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    customFields: [customFieldSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('AssetCategory', assetCategorySchema);
