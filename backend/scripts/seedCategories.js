require('dotenv').config();
const readline = require('readline');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Category = require('../models/Category');
const { PRODUCT_CATEGORIES } = require('../constants/product');
const { RECORD_STATUS } = require('../constants/status');

const SEED_CATEGORIES = [
  {
    name: 'Chó',
    description: 'Sản phẩm và phụ kiện dành cho chó',
    image: '/images/shopping/collec-dog.png',
    displayOrder: 1,
  },
  {
    name: 'Mèo',
    description: 'Sản phẩm và phụ kiện dành cho mèo',
    image: '/images/shopping/collec-cat.png',
    displayOrder: 2,
  },
  {
    name: 'Thức ăn',
    description: 'Thức ăn cho thú cưng',
    image: '/images/shopping/collec-food.png',
    displayOrder: 3,
  },
  {
    name: 'Phụ kiện',
    description: 'Phụ kiện chăm sóc thú cưng',
    image: '/images/shopping/collec-acc.png',
    displayOrder: 4,
  },
];

const LEGACY_CATEGORY_TO_SLUG = {
  [PRODUCT_CATEGORIES.DOG]: 'cho',
  [PRODUCT_CATEGORIES.CAT]: 'meo',
  [PRODUCT_CATEGORIES.FOOD]: 'thuc-an',
  [PRODUCT_CATEGORIES.ACCESSORY]: 'phu-kien',
};

function askConfirmation(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

async function upsertCategoryBySlug(data) {
  const slug = Category.slugify(data.name);

  const category = await Category.findOneAndUpdate(
    { slug },
    {
      $set: {
        name: data.name,
        slug,
        description: data.description || '',
        image: data.image || '',
        displayOrder: data.displayOrder ?? 0,
        isFeatured: data.isFeatured || false,
        status: data.status || RECORD_STATUS.ACTIVE,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return category;
}

async function migrateLegacyProductCategories(categoriesBySlug) {
  const rawCollection = mongoose.connection.db.collection('products');
  const legacyValues = Object.keys(LEGACY_CATEGORY_TO_SLUG);

  const legacyDocs = await rawCollection.find({ category: { $in: legacyValues } }).toArray();

  if (legacyDocs.length === 0) {
    console.log('[Migrate] Không có sản phẩm nào dùng category dạng chuỗi cũ — bỏ qua bước migrate.');
    return;
  }

  console.log(`[Migrate] Tìm thấy ${legacyDocs.length} sản phẩm còn dùng category dạng chuỗi cũ.`);

  let migratedCount = 0;
  for (const doc of legacyDocs) {
    const targetSlug = LEGACY_CATEGORY_TO_SLUG[doc.category];
    const targetCategory = categoriesBySlug[targetSlug];

    if (!targetCategory) {
      console.warn(`[Migrate] Bỏ qua sản phẩm "${doc.name}" — không tìm thấy Category cho "${doc.category}".`);
      // eslint-disable-next-line no-continue
      continue;
    }

    // eslint-disable-next-line no-await-in-loop
    await rawCollection.updateOne({ _id: doc._id }, { $set: { category: targetCategory._id } });
    migratedCount += 1;
  }

  console.log(`[Migrate] Đã chuyển đổi thành công ${migratedCount}/${legacyDocs.length} sản phẩm sang category dạng ObjectId.`);
}

async function seed() {
  await connectDB();

  const forceFlag = process.argv.includes('--force');
  const existingCount = await Category.countDocuments();

  if (existingCount > 0 && !forceFlag) {
    console.log(`[Seed] Hiện đã có ${existingCount} danh mục trong collection "categories".`);
    const answer = await askConfirmation(
      '[Seed] Cập nhật lại 4 danh mục mẫu (upsert theo slug, KHÔNG xóa dữ liệu cũ)? (yes/no): '
    );
    if (answer !== 'yes') {
      console.log('[Seed] Đã hủy — không có gì thay đổi.');
      await mongoose.disconnect();
      process.exit(0);
    }
  }

  const categoriesBySlug = {};
  // eslint-disable-next-line no-restricted-syntax
  for (const data of SEED_CATEGORIES) {
    // eslint-disable-next-line no-await-in-loop
    const category = await upsertCategoryBySlug(data);
    categoriesBySlug[category.slug] = category;
  }
  console.log(`[Seed] Đã upsert thành công ${Object.keys(categoriesBySlug).length} danh mục (giữ nguyên _id nếu đã tồn tại).`);

  await migrateLegacyProductCategories(categoriesBySlug);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('[Seed] Lỗi:', err.message);
  process.exit(1);
});
