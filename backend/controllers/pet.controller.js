const Pet = require('../models/Pet');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { HTTP_STATUS, RECORD_STATUS } = require('../constants');

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 100;

function escapeRegex(text) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildPetFilter({ species, search }) {
  const filter = { status: RECORD_STATUS.ACTIVE };

  if (species) {
    filter.species = species;
  }

  if (search) {
    const safePattern = escapeRegex(search);
    filter.$or = [
      { name: { $regex: safePattern, $options: 'i' } },
      { breed: { $regex: safePattern, $options: 'i' } },
      { description: { $regex: safePattern, $options: 'i' } },
    ];
  }

  return filter;
}

function buildPetSort(sort) {
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
      return { isFeatured: -1, createdAt: -1 };
    case 'newest':
    default:
      return { createdAt: -1 };
  }
}

const listPets = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || DEFAULT_PAGE);
  const limit = Math.max(1, parseInt(req.query.limit, 10) || DEFAULT_LIMIT);

  const filter = buildPetFilter(req.query);
  const sort = buildPetSort(req.query.sort);

  const [items, total] = await Promise.all([
    Pet.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit),
    Pet.countDocuments(filter),
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

const getPetById = asyncHandler(async (req, res) => {
  const pet = await Pet.findOne({ _id: req.params.id, status: RECORD_STATUS.ACTIVE });

  if (!pet) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Không tìm thấy thú cưng');
  }

  res.status(HTTP_STATUS.OK).json({ success: true, data: pet });
});

const createPet = asyncHandler(async (req, res) => {
  const pet = await Pet.create({ ...req.body, createdBy: req.user._id });

  res.status(HTTP_STATUS.CREATED).json({
    success: true,
    message: 'Tạo thú cưng thành công',
    data: pet,
  });
});

const updatePet = asyncHandler(async (req, res) => {
  const pet = await Pet.findById(req.params.id);

  if (!pet) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Không tìm thấy thú cưng');
  }

  Object.assign(pet, req.body);
  await pet.save();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Cập nhật thú cưng thành công',
    data: pet,
  });
});

const deletePet = asyncHandler(async (req, res) => {
  const pet = await Pet.findById(req.params.id);

  if (!pet) {
    throw new ApiError(HTTP_STATUS.NOT_FOUND, 'Không tìm thấy thú cưng');
  }

  await pet.deleteOne();

  res.status(HTTP_STATUS.OK).json({
    success: true,
    message: 'Xóa thú cưng thành công',
  });
});

module.exports = {
  listPets,
  getPetById,
  createPet,
  updatePet,
  deletePet,
};
