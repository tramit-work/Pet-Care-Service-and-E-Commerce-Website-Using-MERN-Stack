const Category = require('../models/Category');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { HTTP_STATUS, RECORD_STATUS } = require('../constants');

const listCategories = asyncHandler(async (req, res) => {
  const filter = req.query.status ? { status: req.query.status } : { status: RECORD_STATUS.ACTIVE };

  const [categories, counts] = await Promise.all([
    Category.find(filter).sort({ displayOrder: 1, name: 1 }),
    Product.aggregate([
      { $match: { status: RECORD_STATUS.ACTIVE } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
    ]),
  ]);

  const countByCategoryId = new Map(counts.map((c) => [String(c._id), c.count]));
  const data = categories.map((category) => {
    const plain = category.toObject();
    plain.productCount = countByCategoryId.get(String(category._id)) || 0;
    return plain;
  });

  res.status(HTTP_STATUS.OK).json({ success: true, data });
});

const getCategoryById = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Không tìm thấy danh mục');
  }

  const productCount = await Product.countDocuments({
    category: category._id,
    status: RECORD_STATUS.ACTIVE,
  });

  const data = category.toObject();
  data.productCount = productCount;

  res.status(HTTP_STATUS.OK).json({ success: true, data });
});

const createCategory = asyncHandler(async (req, res) => {
  const category = await Category.create({ ...req.body, createdBy: req.user._id });

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: 'Tạo danh mục thành công',
    data: category,
  });
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Không tìm thấy danh mục');
  }

  Object.assign(category, req.body);
  await category.save();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Cập nhật danh mục thành công',
    data: category,
  });
});

const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Không tìm thấy danh mục');
  }

  const productCount = await Product.countDocuments({ category: category._id });
  if (productCount > 0) {
    throw new ApiError(
      HTTP_STATUS.CONFLICT,
      `Không thể xóa — còn ${productCount} sản phẩm thuộc danh mục này`
    );
  }

  await category.deleteOne();

  res.status(HTTP_STATUS.OK).json({ success: true, message: 'Xóa danh mục thành công' });
});

module.exports = {
  listCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};
