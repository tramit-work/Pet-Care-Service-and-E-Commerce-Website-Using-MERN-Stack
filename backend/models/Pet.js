const mongoose = require('mongoose');
const slugify = require('../utils/slugify');
const { RECORD_STATUS, STATUS_VALUES } = require('../constants/status');
const { SPECIES_VALUES, GENDER_VALUES, ADOPTION_STATUS, ADOPTION_STATUS_VALUES } = require('../constants/pet');

const petSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên thú cưng là bắt buộc'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    breed: {
      type: String,
      default: '',
      trim: true,
    },
    species: {
      type: String,
      required: [true, 'Giống loài là bắt buộc'],
      enum: {
        values: SPECIES_VALUES,
        message: `Giống loài phải là một trong: ${SPECIES_VALUES.join(', ')}`,
      },
    },
    gender: {
      type: String,
      enum: {
        values: GENDER_VALUES,
        message: `Giới tính phải là một trong: ${GENDER_VALUES.join(', ')}`,
      },
    },
    age: {
      type: Number,
      min: [0, 'Tuổi không được âm'],
      default: 0,
    },
    weight: {
      type: Number,
      min: [0, 'Cân nặng không được âm'],
      default: 0,
    },
    color: {
      type: String,
      default: '',
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Giá là bắt buộc'],
      min: [0, 'Giá không được âm'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    image: {
      type: String,
      required: [true, 'Ảnh thú cưng là bắt buộc'],
    },
    gallery: {
      type: [String],
      default: [],
    },
    vaccination: {
      type: Boolean,
      default: false,
    },
    healthStatus: {
      type: String,
      default: '',
      trim: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
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
    microchipId: {
      type: String,
      default: '',
    },
    adoptionStatus: {
      type: String,
      enum: {
        values: ADOPTION_STATUS_VALUES,
        message: `Trạng thái nhận nuôi phải là một trong: ${ADOPTION_STATUS_VALUES.join(', ')}`,
      },
      default: ADOPTION_STATUS.AVAILABLE,
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

petSchema.pre('save', async function generateUniqueSlug(next) {
  if (!this.isModified('name') && this.slug) return next();

  const baseSlug = slugify(this.name);
  let candidate = baseSlug;
  let counter = 2;
  const Pet = this.constructor;

  while (await Pet.exists({ slug: candidate, _id: { $ne: this._id } })) {
    candidate = `${baseSlug}-${counter}`;
    counter += 1;
  }

  this.slug = candidate;
  next();
});

module.exports = mongoose.model('Pet', petSchema);
