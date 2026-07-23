require('dotenv').config();
const readline = require('readline');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Product = require('../models/Product');
const Category = require('../models/Category');

const LEGACY_CATEGORY_TO_SLUG = {
  Dog: 'cho',
  Cat: 'meo',
  Food: 'thuc-an',
  Accessory: 'phu-kien',
};

async function resolveLegacyCategoryIds() {
  const categories = await Category.find({});

  if (categories.length === 0) {
    throw new Error(
      'Chưa có Category nào trong MongoDB. Hãy chạy "npm run seed:categories" TRƯỚC, rồi mới chạy "npm run seed".'
    );
  }

  const categoryIdBySlug = {};
  categories.forEach((cat) => {
    categoryIdBySlug[cat.slug] = cat._id;
  });

  const categoryIdByLegacyName = {};
  const missing = [];

  Object.entries(LEGACY_CATEGORY_TO_SLUG).forEach(([legacyName, slug]) => {
    if (categoryIdBySlug[slug]) {
      categoryIdByLegacyName[legacyName] = categoryIdBySlug[slug];
    } else {
      missing.push(`${legacyName} (slug mong đợi: ${slug})`);
    }
  });

  if (missing.length > 0) {
    throw new Error(
      `Thiếu Category tương ứng: ${missing.join(', ')}. Hãy chạy "npm run seed:categories" để tạo đủ 4 danh mục trước.`
    );
  }

  return categoryIdByLegacyName;
}

const SEED_PRODUCTS = [
  {
    "name": "Chó Poodle Nhỏ",
    "category": "Dog",
    "description": "Thông minh, thân thiện và dễ huấn luyện. Phù hợp với mọi gia đình.",
    "price": 5000000,
    "originalPrice": 6000000,
    "image": "/images/shopping/poodlenho.png",
    "rating": 4,
    "isNewArrival": true,
    "isSale": true,
    "stock": 20,
    "brand": "",
    "gallery": [],
    "featured": false,
    "status": "active"
  },
  {
    "name": "Chó Poodle Tiny",
    "category": "Dog",
    "description": "Nhỏ gọn, ngoan ngoãn, cực kỳ đáng yêu.",
    "price": 8000000,
    "originalPrice": null,
    "image": "/images/shopping/poodletiny.png",
    "rating": 4,
    "isNewArrival": false,
    "isSale": false,
    "stock": 20,
    "brand": "",
    "gallery": [],
    "featured": false,
    "status": "active"
  },
  {
    "name": "Chó Poodle Toy",
    "category": "Dog",
    "description": "Dễ huấn luyện, lông không rụng, thân thiện.",
    "price": 7500000,
    "originalPrice": null,
    "image": "/images/shopping/poodletoy.png",
    "rating": 5,
    "isNewArrival": false,
    "isSale": false,
    "stock": 20,
    "brand": "",
    "gallery": [],
    "featured": false,
    "status": "active"
  },
  {
    "name": "Mèo Anh Lông Ngắn",
    "category": "Cat",
    "description": "Mặt tròn, lông mịn, hiền lành.",
    "price": 3500000,
    "originalPrice": null,
    "image": "/images/shopping/meoanhlongngan.png",
    "rating": 3,
    "isNewArrival": false,
    "isSale": false,
    "stock": 20,
    "brand": "",
    "gallery": [],
    "featured": false,
    "status": "active"
  },
  {
    "name": "Mèo Anh Lông Dài",
    "category": "Cat",
    "description": "Lông dài xù, mắt to, dễ thương.",
    "price": 4500000,
    "originalPrice": null,
    "image": "/images/shopping/meoanhlongdai.png",
    "rating": 3,
    "isNewArrival": false,
    "isSale": false,
    "stock": 20,
    "brand": "",
    "gallery": [],
    "featured": false,
    "status": "active"
  },
  {
    "name": "Mèo Ba Tư",
    "category": "Cat",
    "description": "Mặt bánh bao, lông dày, tính cách ngoan.",
    "price": 4500000,
    "originalPrice": 5000000,
    "image": "/images/shopping/meobatu.png",
    "rating": 5,
    "isNewArrival": false,
    "isSale": true,
    "stock": 20,
    "brand": "",
    "gallery": [],
    "featured": false,
    "status": "active"
  },
  {
    "name": "Hạt Royal Canin cho chó nhỏ 2kg",
    "category": "Food",
    "description": "Hỗ trợ tiêu hoá, dễ nhai.",
    "price": 320000,
    "originalPrice": null,
    "image": "/images/shopping/hatchochonho.png",
    "rating": 4,
    "isNewArrival": true,
    "isSale": false,
    "stock": 20,
    "brand": "",
    "gallery": [],
    "featured": false,
    "status": "active"
  },
  {
    "name": "Hạt Bite of Wild cho mèo",
    "category": "Food",
    "description": "Đầy đủ dinh dưỡng, giúp lông bóng mượt, tiêu hoá khoẻ.",
    "price": 210000,
    "originalPrice": 240000,
    "image": "/images/shopping/hatchomeo.png",
    "rating": 4,
    "isNewArrival": false,
    "isSale": true,
    "stock": 20,
    "brand": "",
    "gallery": [],
    "featured": false,
    "status": "active"
  },
  {
    "name": "Pate Whiskas cho mèo",
    "category": "Food",
    "description": "Hương vị hấp dẫn, kích thích ăn ngon.",
    "price": 22000,
    "originalPrice": null,
    "image": "/images/shopping/pate.png",
    "rating": 3,
    "isNewArrival": false,
    "isSale": false,
    "stock": 20,
    "brand": "",
    "gallery": [],
    "featured": false,
    "status": "active"
  },
  {
    "name": "Dây dắt chó kéo giãn 5m",
    "category": "Accessory",
    "description": "Có nút khoá, dùng đi dạo an toàn.",
    "price": 150000,
    "originalPrice": null,
    "image": "/images/shopping/daydat.png",
    "rating": 4,
    "isNewArrival": false,
    "isSale": false,
    "stock": 20,
    "brand": "",
    "gallery": [],
    "featured": false,
    "status": "active"
  },
  {
    "name": "Vòng cổ chuông nhỏ cho mèo",
    "category": "Accessory",
    "description": "Nhỏ gọn, có chuông xinh xắn.",
    "price": 40000,
    "originalPrice": null,
    "image": "/images/shopping/vongco.png",
    "rating": 4,
    "isNewArrival": false,
    "isSale": false,
    "stock": 20,
    "brand": "",
    "gallery": [],
    "featured": false,
    "status": "active"
  },
  {
    "name": "Lồng vận chuyển thú cưng",
    "category": "Accessory",
    "description": "Nhựa chắc chắn, thoáng khí.",
    "price": 320000,
    "originalPrice": null,
    "image": "/images/shopping/longvanchuyen.png",
    "rating": 4,
    "isNewArrival": false,
    "isSale": false,
    "stock": 20,
    "brand": "",
    "gallery": [],
    "featured": false,
    "status": "active"
  },
  {
    "name": "Chó Corgi Wales",
    "category": "Dog",
    "description": "Chân ngắn, mông to, cực kỳ đáng yêu.",
    "price": 10000000,
    "originalPrice": null,
    "image": "/images/shopping/chocorgi.png",
    "rating": 3,
    "isNewArrival": false,
    "isSale": false,
    "stock": 20,
    "brand": "",
    "gallery": [],
    "featured": false,
    "status": "active"
  },
  {
    "name": "Chó Phốc Sóc",
    "category": "Dog",
    "description": "Nhỏ nhắn, lanh lợi, thích hợp nhà nhỏ.",
    "price": 8000000,
    "originalPrice": null,
    "image": "/images/shopping/chophocsoc.png",
    "rating": 3,
    "isNewArrival": false,
    "isSale": false,
    "stock": 20,
    "brand": "",
    "gallery": [],
    "featured": false,
    "status": "active"
  },
  {
    "name": "Chó Alaska",
    "category": "Dog",
    "description": "Thân hình to lớn, trung thành, lông dày đẹp.",
    "price": 14000000,
    "originalPrice": null,
    "image": "/images/shopping/alaska.png",
    "rating": 4,
    "isNewArrival": false,
    "isSale": false,
    "stock": 20,
    "brand": "",
    "gallery": [],
    "featured": false,
    "status": "active"
  },
  {
    "name": "Mèo Chân Ngắn",
    "category": "Cat",
    "description": "Chân ngắn cực kỳ đáng yêu, hiền lành.",
    "price": 7500000,
    "originalPrice": null,
    "image": "/images/shopping/meochanngan.png",
    "rating": 3,
    "isNewArrival": true,
    "isSale": false,
    "stock": 20,
    "brand": "",
    "gallery": [],
    "featured": false,
    "status": "active"
  },
  {
    "name": "Mèo Ragdoll",
    "category": "Cat",
    "description": "Ôm rất ngoan, hiền, thông minh.",
    "price": 9000000,
    "originalPrice": null,
    "image": "/images/shopping/meoragdoll.png",
    "rating": 3,
    "isNewArrival": false,
    "isSale": false,
    "stock": 20,
    "brand": "",
    "gallery": [],
    "featured": false,
    "status": "active"
  },
  {
    "name": "Mèo Sphynx",
    "category": "Cat",
    "description": "Da trơn, độc lạ, hiếm.",
    "price": 20500000,
    "originalPrice": 25000000,
    "image": "/images/shopping/meosphynx.png",
    "rating": 3,
    "isNewArrival": false,
    "isSale": true,
    "stock": 20,
    "brand": "",
    "gallery": [],
    "featured": false,
    "status": "active"
  },
  {
    "name": "Pate Pedigree gói 130g",
    "category": "Food",
    "description": "Vị ngon, dễ ăn, hấp dẫn.",
    "price": 25000,
    "originalPrice": null,
    "image": "/images/shopping/patepedigree.png",
    "rating": 5,
    "isNewArrival": true,
    "isSale": false,
    "stock": 20,
    "brand": "",
    "gallery": [],
    "featured": false,
    "status": "active"
  },
  {
    "name": "Xương gặm cho chó vị sữa",
    "category": "Food",
    "description": "Giữ răng chắc khỏe.",
    "price": 35000,
    "originalPrice": null,
    "image": "/images/shopping/xuonggam.png",
    "rating": 5,
    "isNewArrival": false,
    "isSale": false,
    "stock": 20,
    "brand": "",
    "gallery": [],
    "featured": false,
    "status": "active"
  },
  {
    "name": "Snack cá khô cho mèo",
    "category": "Food",
    "description": "Nhiều đạm, dễ tiêu hoá.",
    "price": 55000,
    "originalPrice": null,
    "image": "/images/shopping/cakho.png",
    "rating": 4,
    "isNewArrival": true,
    "isSale": false,
    "stock": 20,
    "brand": "",
    "gallery": [],
    "featured": false,
    "status": "active"
  },
  {
    "name": "Bàn chải chải lông tự rụng",
    "category": "Accessory",
    "description": "Tự gom lông rụng hiệu quả.",
    "price": 90000,
    "originalPrice": null,
    "image": "/images/shopping/banchai.png",
    "rating": 5,
    "isNewArrival": false,
    "isSale": false,
    "stock": 20,
    "brand": "",
    "gallery": [],
    "featured": false,
    "status": "active"
  },
  {
    "name": "Cát vệ sinh mèo mùi cafe",
    "category": "Accessory",
    "description": "Khử mùi, vón tốt, tiết kiệm.",
    "price": 80000,
    "originalPrice": null,
    "image": "/images/shopping/catvesinh.png",
    "rating": 3,
    "isNewArrival": false,
    "isSale": false,
    "stock": 20,
    "brand": "",
    "gallery": [],
    "featured": false,
    "status": "active"
  },
  {
    "name": "Khay vệ sinh cho mèo",
    "category": "Accessory",
    "description": "Kèm xẻng, kích thước lớn.",
    "price": 160000,
    "originalPrice": null,
    "image": "/images/shopping/khayvesinh.png",
    "rating": 4,
    "isNewArrival": false,
    "isSale": false,
    "stock": 20,
    "brand": "",
    "gallery": [],
    "featured": false,
    "status": "active"
  },
  {
    "name": "Chó Husky",
    "category": "Dog",
    "description": "Ngoại hình ngầu, tính cách thân thiện, vui vẻ.",
    "price": 12000000,
    "originalPrice": null,
    "image": "/images/shopping/chohusky.png",
    "rating": 5,
    "isNewArrival": false,
    "isSale": false,
    "stock": 20,
    "brand": "",
    "gallery": [],
    "featured": false,
    "status": "active"
  },
  {
    "name": "Chó Samoyed",
    "category": "Dog",
    "description": "Lông trắng như tuyết, siêu thân thiện, đáng yêu.",
    "price": 13000000,
    "originalPrice": null,
    "image": "/images/shopping/chosamoyed.png",
    "rating": 5,
    "isNewArrival": false,
    "isSale": false,
    "stock": 20,
    "brand": "",
    "gallery": [],
    "featured": false,
    "status": "active"
  },
  {
    "name": "Chó Golden Retriever",
    "category": "Dog",
    "description": "Hiền lành, thông minh, thích chơi với trẻ em.",
    "price": 9500000,
    "originalPrice": null,
    "image": "/images/shopping/chogolden.png",
    "rating": 3,
    "isNewArrival": false,
    "isSale": false,
    "stock": 20,
    "brand": "",
    "gallery": [],
    "featured": false,
    "status": "active"
  },
  {
    "name": "Mèo Bengal",
    "category": "Cat",
    "description": "Lông vằn như báo, năng động, quý hiếm.",
    "price": 12000000,
    "originalPrice": null,
    "image": "/images/shopping/meobengal.png",
    "rating": 4,
    "isNewArrival": true,
    "isSale": false,
    "stock": 20,
    "brand": "",
    "gallery": [],
    "featured": false,
    "status": "active"
  },
  {
    "name": "Mèo Tai Cụp",
    "category": "Cat",
    "description": "Tai cụp dễ thương, thân thiện.",
    "price": 6000000,
    "originalPrice": null,
    "image": "/images/shopping/meotaicup.png",
    "rating": 4,
    "isNewArrival": true,
    "isSale": false,
    "stock": 20,
    "brand": "",
    "gallery": [],
    "featured": false,
    "status": "active"
  },
  {
    "name": "Mèo Maine Coon",
    "category": "Cat",
    "description": "Lớn, lông xù, tính cách hoàng gia.",
    "price": 50000000,
    "originalPrice": 55000000,
    "image": "/images/shopping/meomaincoon.png",
    "rating": 4,
    "isNewArrival": true,
    "isSale": true,
    "stock": 20,
    "brand": "",
    "gallery": [],
    "featured": false,
    "status": "active"
  },
  {
    "name": "Hạt Fitmin cho mèo lớn 3kg",
    "category": "Food",
    "description": "Ít béo, tăng đề kháng.",
    "price": 290000,
    "originalPrice": null,
    "image": "/images/shopping/hatfitmin.png",
    "rating": 3,
    "isNewArrival": false,
    "isSale": false,
    "stock": 20,
    "brand": "",
    "gallery": [],
    "featured": false,
    "status": "active"
  },
  {
    "name": "Súp thưởng Ciao cho mèo",
    "category": "Food",
    "description": "Dễ ăn, nhiều vị, chống ngán.",
    "price": 10000,
    "originalPrice": null,
    "image": "/images/shopping/supthuong.png",
    "rating": 4,
    "isNewArrival": false,
    "isSale": false,
    "stock": 20,
    "brand": "",
    "gallery": [],
    "featured": false,
    "status": "active"
  },
  {
    "name": "Bánh cá cho mèo",
    "category": "Food",
    "description": "Thơm ngon, dễ ăn, kích thích vị giác.",
    "price": 20000,
    "originalPrice": null,
    "image": "/images/shopping/banhca.png",
    "rating": 4,
    "isNewArrival": true,
    "isSale": false,
    "stock": 20,
    "brand": "",
    "gallery": [],
    "featured": false,
    "status": "active"
  },
  {
    "name": "Áo hoodie cho chó nhỏ",
    "category": "Accessory",
    "description": "Dễ thương, giữ ấm, co giãn.",
    "price": 60000,
    "originalPrice": null,
    "image": "/images/shopping/aohoodie.png",
    "rating": 4,
    "isNewArrival": false,
    "isSale": false,
    "stock": 20,
    "brand": "",
    "gallery": [],
    "featured": false,
    "status": "active"
  },
  {
    "name": "Rọ mõm mềm cho chó",
    "category": "Accessory",
    "description": "An toàn khi ra đường.",
    "price": 70000,
    "originalPrice": null,
    "image": "/images/shopping/romom.png",
    "rating": 5,
    "isNewArrival": false,
    "isSale": false,
    "stock": 20,
    "brand": "",
    "gallery": [],
    "featured": false,
    "status": "active"
  },
  {
    "name": "Lều ngủ mèo gấp gọn",
    "category": "Accessory",
    "description": "Có đệm, gọn nhẹ, dễ xếp.",
    "price": 240000,
    "originalPrice": 360000,
    "image": "/images/shopping/leungu.png",
    "rating": 4,
    "isNewArrival": true,
    "isSale": true,
    "stock": 20,
    "brand": "",
    "gallery": [],
    "featured": false,
    "status": "active"
  },
  {
    "name": "Chó Chihuahua",
    "category": "Dog",
    "description": "Siêu nhỏ, trung thành, cảnh báo tốt.",
    "price": 4800000,
    "originalPrice": null,
    "image": "/images/shopping/chochihuahua.png",
    "rating": 5,
    "isNewArrival": false,
    "isSale": false,
    "stock": 20,
    "brand": "",
    "gallery": [],
    "featured": false,
    "status": "active"
  },
  {
    "name": "Chó Bull Pháp",
    "category": "Dog",
    "description": "Mặt nhăn đặc trưng, hiền lành, không sủa nhiều.",
    "price": 10000000,
    "originalPrice": null,
    "image": "/images/shopping/chobull.png",
    "rating": 4,
    "isNewArrival": false,
    "isSale": false,
    "stock": 20,
    "brand": "",
    "gallery": [],
    "featured": false,
    "status": "active"
  },
  {
    "name": "Chó Becgie Đức",
    "category": "Dog",
    "description": "Thông minh, huấn luyện tốt, bảo vệ tuyệt vời.",
    "price": 11500000,
    "originalPrice": null,
    "image": "/images/shopping/becgie.png",
    "rating": 3,
    "isNewArrival": false,
    "isSale": false,
    "stock": 20,
    "brand": "",
    "gallery": [],
    "featured": false,
    "status": "active"
  },
  {
    "name": "Mèo Burmese",
    "category": "Cat",
    "description": "Dễ gần, mắt to, rất thân thiện.",
    "price": 4200000,
    "originalPrice": null,
    "image": "/images/shopping/burmese.png",
    "rating": 4,
    "isNewArrival": true,
    "isSale": false,
    "stock": 20,
    "brand": "",
    "gallery": [],
    "featured": false,
    "status": "active"
  },
  {
    "name": "Mèo Abyssinian",
    "category": "Cat",
    "description": "Cổ điển, linh hoạt, cực kỳ năng động.",
    "price": 5500000,
    "originalPrice": null,
    "image": "/images/shopping/abyssinian.png",
    "rating": 5,
    "isNewArrival": false,
    "isSale": false,
    "stock": 20,
    "brand": "",
    "gallery": [],
    "featured": false,
    "status": "active"
  },
  {
    "name": "Mèo Nga Xanh",
    "category": "Cat",
    "description": "Lông xanh ánh bạc, mắt xanh đẹp mê ly.",
    "price": 6500000,
    "originalPrice": 7500000,
    "image": "/images/shopping/ngaxanh.png",
    "rating": 4,
    "isNewArrival": false,
    "isSale": true,
    "stock": 20,
    "brand": "",
    "gallery": [],
    "featured": false,
    "status": "active"
  },
  {
    "name": "Snack gà sấy cho mèo",
    "category": "Food",
    "description": "Ít béo, nhiều dinh dưỡng.",
    "price": 28000,
    "originalPrice": null,
    "image": "/images/shopping/snackga.png",
    "rating": 3,
    "isNewArrival": true,
    "isSale": false,
    "stock": 20,
    "brand": "",
    "gallery": [],
    "featured": false,
    "status": "active"
  },
  {
    "name": "Vitamin tổng hợp dạng viên",
    "category": "Food",
    "description": "Tăng miễn dịch.",
    "price": 85000,
    "originalPrice": null,
    "image": "/images/shopping/vitamin.png",
    "rating": 4,
    "isNewArrival": false,
    "isSale": false,
    "stock": 20,
    "brand": "",
    "gallery": [],
    "featured": false,
    "status": "active"
  },
  {
    "name": "Sữa bột Bio Milk cho thú cưng",
    "category": "Food",
    "description": "Dễ hấp thụ, bổ sung canxi.",
    "price": 120000,
    "originalPrice": null,
    "image": "/images/shopping/suabot.png",
    "rating": 4,
    "isNewArrival": false,
    "isSale": false,
    "stock": 20,
    "brand": "",
    "gallery": [],
    "featured": false,
    "status": "active"
  },
  {
    "name": "Chuồng sắt 2 tầng gấp gọn",
    "category": "Accessory",
    "description": "Có bánh xe, tiện vệ sinh.",
    "price": 680000,
    "originalPrice": null,
    "image": "/images/shopping/chuong.png",
    "rating": 3,
    "isNewArrival": false,
    "isSale": false,
    "stock": 20,
    "brand": "",
    "gallery": [],
    "featured": false,
    "status": "active"
  },
  {
    "name": "Thảm làm mát thú cưng",
    "category": "Accessory",
    "description": "Dùng hè, không cần điện.",
    "price": 170000,
    "originalPrice": null,
    "image": "/images/shopping/tham.png",
    "rating": 5,
    "isNewArrival": true,
    "isSale": false,
    "stock": 20,
    "brand": "",
    "gallery": [],
    "featured": false,
    "status": "active"
  },
  {
    "name": "Túi xách đeo vai vận chuyển",
    "category": "Accessory",
    "description": "Vải lưới thoáng khí, tiện lợi.",
    "price": 350000,
    "originalPrice": null,
    "image": "/images/shopping/tuixach.png",
    "rating": 4,
    "isNewArrival": true,
    "isSale": false,
    "stock": 20,
    "brand": "",
    "gallery": [],
    "featured": false,
    "status": "active"
  }
];

function askConfirmation(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

async function seed() {
  await connectDB();

  const categoryIdByLegacyName = await resolveLegacyCategoryIds();

  const productsToSeed = SEED_PRODUCTS.map((item) => {
    const categoryId = categoryIdByLegacyName[item.category];
    if (!categoryId) {
      throw new Error(`Không tìm thấy Category cho "${item.category}" (sản phẩm "${item.name}").`);
    }
    return { ...item, category: categoryId };
  });

  const forceFlag = process.argv.includes('--force');

  const existingCount = await Product.countDocuments();
  if (existingCount > 0) {
    console.log(`[Seed] Hiện đã có ${existingCount} sản phẩm trong collection "products".`);

    if (!forceFlag) {
      const answer = await askConfirmation(
        '[Seed] Xóa toàn bộ sản phẩm cũ và nạp lại 48 sản phẩm mẫu? (yes/no): '
      );
      if (answer !== 'yes') {
        console.log('[Seed] Đã hủy — không có gì thay đổi.');
        await mongoose.disconnect();
        process.exit(0);
      }
    } else {
      console.log('[Seed] Cờ --force được bật — bỏ qua bước xác nhận.');
    }

    await Product.deleteMany({});
    console.log('[Seed] Đã xóa dữ liệu Product cũ.');
  }

  const created = await Product.create(productsToSeed);
  console.log(`[Seed] Đã nạp thành công ${created.length} sản phẩm vào MongoDB.`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('[Seed] Lỗi khi nạp dữ liệu:', err);
  process.exit(1);
});
