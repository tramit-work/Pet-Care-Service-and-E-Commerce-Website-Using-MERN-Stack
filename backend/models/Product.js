const mongoose = require('mongoose');
const { RECORD_STATUS, STATUS_VALUES } = require('../constants/status');
const slugify = require('../utils/slugify');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên sản phẩm là bắt buộc'],
      trim: true,
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

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Danh mục là bắt buộc'],
    },
    brand: {
      type: String,
      default: '',
      trim: true,
    },

    price: {
      type: Number,
      required: [true, 'Giá là bắt buộc'],
      min: [0, 'Giá không được âm'],
    },
    originalPrice: {
      type: Number,
      min: [0, 'Giá gốc không được âm'],
      default: null,
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, 'Số lượng tồn kho không được âm'],
    },
    image: {
      type: String,
      required: [true, 'Ảnh sản phẩm là bắt buộc'],
    },
    gallery: {
      type: [String],
      default: [],
    },
    rating: {
      type: Number,
      min: [0, 'Đánh giá tối thiểu là 0'],
      max: [5, 'Đánh giá tối đa là 5'],
      default: 0,
    },

    sold: {
      type: Number,
      default: 0,
      min: [0, 'Số lượng đã bán không được âm'],
    },
    numReviews: {
      type: Number,
      default: 0,
      min: [0, 'Số lượng đánh giá không được âm'],
    },

    isNewArrival: {
      type: Boolean,
      default: false,
    },
    isSale: {
      type: Boolean,
      default: false,
    },
    featured: {
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


productSchema.pre('save', async function generateUniqueSlug(next) {
  if (!this.isModified('name') && this.slug) return next();

  const baseSlug = slugify(this.name);
  let candidate = baseSlug;
  let counter = 2;
  const Product = this.constructor;

  while (await Product.exists({ slug: candidate, _id: { $ne: this._id } })) {
    candidate = `${baseSlug}-${counter}`;
    counter += 1;
  }

  this.slug = candidate;
  next();
});

module.exports = mongoose.model('Product', productSchema);
