const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { HTTP_STATUS, RECORD_STATUS } = require('../constants');

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 100;

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function resolveCategoryId(categoryParam) {
  if (mongoose.Types.ObjectId.isValid(categoryParam)) {
    return categoryParam;
  }
  const category = await Category.findOne({ slug: categoryParam });
  return category ? String(category._id) : null;
}

async function buildProductFilter({ category, search }) {
  const filter = { status: RECORD_STATUS.ACTIVE };

  if (category) {
    const categoryId = await resolveCategoryId(category);

    filter.category = categoryId || null;
  }

  if (search) {
    const safePattern = escapeRegex(search);
    filter.$or = [
      { name: { $regex: safePattern, $options: 'i' } },
      { description: { $regex: safePattern, $options: 'i' } },
    ];
  }

  return filter;
}

function buildProductSort(sort) {
  switch (sort) {
    case 'price_asc':
    case 'price-low':
      return { price: 1 };
    case 'price_desc':
    case 'price-high':
      return { price: -1 };
    case 'oldest':
      return { createdAt: 1 };
    case 'rating':
      return { rating: -1 };
    case 'featured':
      return { featured: -1, createdAt: -1 };
    case 'newest':
    default:
      return { createdAt: -1 };
  }
}

const listProducts = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || DEFAULT_PAGE);
  const limit = Math.max(1, parseInt(req.query.limit, 10) || DEFAULT_LIMIT);

  const filter = await buildProductFilter(req.query);
  const sort = buildProductSort(req.query.sort);

  const [items, total] = await Promise.all([
    Product.find(filter)
      .populate('category', 'name slug image')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  res.status(HTTP_STATUS.OK).json({
    success: true,
    data: items,
    pagination: {
      page,
      limit,

      totalItems: total,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  });
});

const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ _id: req.params.id, status: RECORD_STATUS.ACTIVE }).populate(
    'category',
    'name slug image'
  );

  if (!product) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Không tìm thấy sản phẩm');
  }

  res.status(HTTP_STATUS.OK).json({ success: true, data: product });
});

const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create({ ...req.body, createdBy: req.user._id });
  await product.populate('category', 'name slug image');

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: 'Tạo sản phẩm thành công',
    data: product,
  });
});

const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Không tìm thấy sản phẩm');
  }

  Object.assign(product, req.body);
  await product.save();
  await product.populate('category', 'name slug image');

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Cập nhật sản phẩm thành công',
    data: product,
  });
});

const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Không tìm thấy sản phẩm');
  }

  await product.deleteOne();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Xóa sản phẩm thành công',
  });
});

module.exports = {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
