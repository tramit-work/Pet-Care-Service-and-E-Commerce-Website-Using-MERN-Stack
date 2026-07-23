const mongoose = require('mongoose');
const { RECORD_STATUS, STATUS_VALUES } = require('../constants/status');
const slugify = require('../utils/slugify');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên danh mục là bắt buộc'],
      trim: true,
      unique: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    image: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: '',
    },
    displayOrder: {
      type: Number,
      default: 0,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: {
        values: STATUS_VALUES,
        message: `Trạng thái phải là một trong: ${STATUS_VALUES.join(', ')}`,
      },
      default: RECORD_STATUS.ACTIVE,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

categorySchema.pre('save', async function generateUniqueSlug(next) {
  if (!this.isModified('name') && this.slug) return next();

  const baseSlug = slugify(this.name);
  let candidate = baseSlug;
  let counter = 2;
  const Category = this.constructor;

  while (await Category.exists({ slug: candidate, _id: { $ne: this._id } })) {
    candidate = `${baseSlug}-${counter}`;
    counter += 1;
  }

  this.slug = candidate;
  next();
});

module.exports = mongoose.model('Category', categorySchema);

module.exports.slugify = slugify;
