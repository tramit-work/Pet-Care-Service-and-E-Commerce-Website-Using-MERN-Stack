require('dotenv').config();
const readline = require('readline');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Pet = require('../models/Pet');
const slugify = require('../utils/slugify');
const { PET_SPECIES, PET_GENDER, ADOPTION_STATUS } = require('../constants/pet');
const { RECORD_STATUS } = require('../constants/status');

const SEED_PETS = [
  { name: 'Poodle Tiny Nâu', breed: 'Poodle', species: PET_SPECIES.DOG, gender: PET_GENDER.FEMALE, age: 4, weight: 2.5, color: 'Nâu', price: 6500000, description: 'Poodle tiny lông xoăn mềm mại, tính cách hoạt bát, thân thiện với trẻ nhỏ.', image: '/images/shopping/poodlenho.png', vaccination: true, healthStatus: 'Khỏe mạnh, đã tiêm phòng đầy đủ', isFeatured: true },
  { name: 'Phốc Sóc Kem', breed: 'Pomeranian', species: PET_SPECIES.DOG, gender: PET_GENDER.MALE, age: 3, weight: 2.2, color: 'Kem', price: 7000000, description: 'Phốc sóc lông bông dày, lanh lợi, thích hợp nuôi trong căn hộ.', image: '/images/shopping/chophocsoc.png', vaccination: true, healthStatus: 'Khỏe mạnh' },
  { name: 'Corgi Vện', breed: 'Corgi', species: PET_SPECIES.DOG, gender: PET_GENDER.MALE, age: 5, weight: 9, color: 'Vện trắng', price: 12000000, description: 'Corgi chân ngắn đáng yêu, thông minh, dễ huấn luyện.', image: '/images/shopping/corgi.png', vaccination: true, healthStatus: 'Khỏe mạnh', isFeatured: true },
  { name: 'Golden Retriever Vàng', breed: 'Golden Retriever', species: PET_SPECIES.DOG, gender: PET_GENDER.MALE, age: 6, weight: 22, color: 'Vàng', price: 15000000, description: 'Golden hiền lành, trung thành, rất hợp với gia đình có trẻ nhỏ.', image: '/images/shopping/golden.png', vaccination: true, healthStatus: 'Khỏe mạnh' },
  { name: 'Husky Mắt Xanh', breed: 'Husky Siberia', species: PET_SPECIES.DOG, gender: PET_GENDER.FEMALE, age: 4, weight: 18, color: 'Đen trắng', price: 13500000, description: 'Husky năng động, mắt xanh nổi bật, cần vận động nhiều.', image: '/images/shopping/husky.png', vaccination: true, healthStatus: 'Khỏe mạnh' },
  { name: 'Chihuahua Nhỏ Xíu', breed: 'Chihuahua', species: PET_SPECIES.DOG, gender: PET_GENDER.FEMALE, age: 2, weight: 1.8, color: 'Nâu đỏ', price: 5500000, description: 'Chihuahua bé xíu, lanh lợi, phù hợp người sống một mình.', image: '/images/shopping/chihuahua.png', vaccination: true, healthStatus: 'Khỏe mạnh' },
  { name: 'Alaska Tuyết', breed: 'Alaskan Malamute', species: PET_SPECIES.DOG, gender: PET_GENDER.MALE, age: 7, weight: 28, color: 'Trắng xám', price: 16000000, description: 'Alaska to khỏe, bộ lông dày ấm áp, tính cách điềm tĩnh.', image: '/images/shopping/alaska.png', vaccination: true, healthStatus: 'Khỏe mạnh' },
  { name: 'Shiba Inu Cam', breed: 'Shiba Inu', species: PET_SPECIES.DOG, gender: PET_GENDER.MALE, age: 3, weight: 10, color: 'Cam vàng', price: 14000000, description: 'Shiba biểu cảm hài hước, độc lập, khá sạch sẽ.', image: '/images/shopping/shiba.png', vaccination: true, healthStatus: 'Khỏe mạnh', isFeatured: true },
  { name: 'Pug Mặt Xệ', breed: 'Pug', species: PET_SPECIES.DOG, gender: PET_GENDER.FEMALE, age: 3, weight: 7, color: 'Vàng nâu', price: 8500000, description: 'Pug mặt xệ đáng yêu, thân thiện, thích được ôm ấp.', image: '/images/shopping/pug.png', vaccination: true, healthStatus: 'Khỏe mạnh' },
  { name: 'Bulldog Pháp Xám', breed: 'Bulldog Pháp', species: PET_SPECIES.DOG, gender: PET_GENDER.MALE, age: 4, weight: 11, color: 'Xám', price: 18000000, description: 'Bulldog Pháp tai dơi đặc trưng, ít sủa, hiền lành.', image: '/images/shopping/bulldog.png', vaccination: true, healthStatus: 'Khỏe mạnh' },
  { name: 'Labrador Đen', breed: 'Labrador', species: PET_SPECIES.DOG, gender: PET_GENDER.MALE, age: 5, weight: 25, color: 'Đen', price: 11000000, description: 'Labrador thông minh, dễ huấn luyện, rất trung thành.', image: '/images/shopping/labrador.png', vaccination: true, healthStatus: 'Khỏe mạnh' },
  { name: 'Border Collie Đốm', breed: 'Border Collie', species: PET_SPECIES.DOG, gender: PET_GENDER.FEMALE, age: 3, weight: 16, color: 'Đen trắng', price: 12500000, description: 'Border Collie cực kỳ thông minh, thích hợp huấn luyện nâng cao.', image: '/images/shopping/collie.png', vaccination: true, healthStatus: 'Khỏe mạnh' },
  { name: 'Beagle Lang Ben', breed: 'Beagle', species: PET_SPECIES.DOG, gender: PET_GENDER.MALE, age: 2, weight: 9, color: 'Nâu trắng đen', price: 9500000, description: 'Beagle mũi thính, vui vẻ, thích khám phá.', image: '/images/shopping/beagle.png', vaccination: true, healthStatus: 'Khỏe mạnh' },
  { name: 'Xúc Xích Lùn', breed: 'Dachshund', species: PET_SPECIES.DOG, gender: PET_GENDER.FEMALE, age: 3, weight: 6, color: 'Nâu đỏ', price: 8000000, description: 'Dachshund thân dài chân ngắn độc đáo, tính cách vui vẻ.', image: '/images/shopping/dachshund.png', vaccination: true, healthStatus: 'Khỏe mạnh' },

  { name: 'Anh Lông Ngắn Xám', breed: 'British Shorthair', species: PET_SPECIES.CAT, gender: PET_GENDER.FEMALE, age: 3, weight: 4, color: 'Xám xanh', price: 9000000, description: 'Mèo Anh lông ngắn tròn trịa, tính cách điềm đạm, ít kêu.', image: '/images/shopping/meotaicup.png', vaccination: true, healthStatus: 'Khỏe mạnh', isFeatured: true },
  { name: 'Ba Tư Lông Dài', breed: 'Persian', species: PET_SPECIES.CAT, gender: PET_GENDER.FEMALE, age: 4, weight: 4.5, color: 'Trắng', price: 11000000, description: 'Mèo Ba Tư lông dài mượt, mặt tròn đặc trưng, cần chải lông thường xuyên.', image: '/images/shopping/persian.png', vaccination: true, healthStatus: 'Khỏe mạnh' },
  { name: 'Tai Cụp Scotland', breed: 'Scottish Fold', species: PET_SPECIES.CAT, gender: PET_GENDER.MALE, age: 2, weight: 3.5, color: 'Xám vàng', price: 12000000, description: 'Mèo tai cụp đặc trưng, tính cách hiền lành, gắn bó với chủ.', image: '/images/shopping/scottishfold.png', vaccination: true, healthStatus: 'Khỏe mạnh', isFeatured: true },
  { name: 'Munchkin Chân Ngắn', breed: 'Munchkin', species: PET_SPECIES.CAT, gender: PET_GENDER.FEMALE, age: 2, weight: 2.8, color: 'Vàng trắng', price: 13500000, description: 'Mèo Munchkin chân ngắn đáng yêu, năng động, thích chạy nhảy.', image: '/images/shopping/munchkin.png', vaccination: true, healthStatus: 'Khỏe mạnh' },
  { name: 'Maine Coon Khổng Lồ', breed: 'Maine Coon', species: PET_SPECIES.CAT, gender: PET_GENDER.MALE, age: 5, weight: 7, color: 'Nâu vện', price: 16500000, description: 'Maine Coon kích thước lớn, lông dày, tính cách thân thiện như chó.', image: '/images/shopping/mainecoon.png', vaccination: true, healthStatus: 'Khỏe mạnh' },
  { name: 'Xiêm Mắt Xanh', breed: 'Siamese', species: PET_SPECIES.CAT, gender: PET_GENDER.FEMALE, age: 3, weight: 3.2, color: 'Kem nâu', price: 8500000, description: 'Mèo Xiêm mắt xanh biếc, hay "nói chuyện", quấn chủ.', image: '/images/shopping/siamese.png', vaccination: true, healthStatus: 'Khỏe mạnh' },
  { name: 'Ragdoll Búp Bê', breed: 'Ragdoll', species: PET_SPECIES.CAT, gender: PET_GENDER.FEMALE, age: 4, weight: 4.8, color: 'Trắng xám', price: 14000000, description: 'Ragdoll tính cách mềm mại như búp bê, rất hiền và thích được bế.', image: '/images/shopping/ragdoll.png', vaccination: true, healthStatus: 'Khỏe mạnh' },
  { name: 'Sphynx Không Lông', breed: 'Sphynx', species: PET_SPECIES.CAT, gender: PET_GENDER.MALE, age: 3, weight: 3.8, color: 'Hồng da', price: 20000000, description: 'Mèo Sphynx không lông độc đáo, ấm áp khi ôm, cần chăm sóc da đặc biệt.', image: '/images/shopping/sphynx.png', vaccination: true, healthStatus: 'Khỏe mạnh', isFeatured: true },
  { name: 'Bengal Đốm Báo', breed: 'Bengal', species: PET_SPECIES.CAT, gender: PET_GENDER.MALE, age: 2, weight: 4.2, color: 'Vàng đốm đen', price: 18500000, description: 'Mèo Bengal hoa văn như báo, năng động, thích leo trèo.', image: '/images/shopping/bengal.png', vaccination: true, healthStatus: 'Khỏe mạnh' },
  { name: 'Nga Xanh Huyền Bí', breed: 'Russian Blue', species: PET_SPECIES.CAT, gender: PET_GENDER.FEMALE, age: 3, weight: 3.6, color: 'Xanh xám', price: 10500000, description: 'Mèo Nga xanh lông ánh bạc, tính cách nhẹ nhàng, hơi nhút nhát.', image: '/images/shopping/russianblue.png', vaccination: true, healthStatus: 'Khỏe mạnh' },
  { name: 'Miêu Mun Đen Tuyền', breed: 'Mèo ta lông đen', species: PET_SPECIES.CAT, gender: PET_GENDER.MALE, age: 1, weight: 2.5, color: 'Đen tuyền', price: 1500000, description: 'Mèo ta lông đen tuyền, tinh nghịch, dễ nuôi, thích hợp người mới.', image: '/images/shopping/meoden.png', vaccination: false, healthStatus: 'Khỏe mạnh, chưa tiêm phòng đầy đủ', adoptionStatus: ADOPTION_STATUS.AVAILABLE },
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

async function upsertPetBySlug(data) {
  const slug = slugify(data.name);

  const pet = await Pet.findOneAndUpdate(
    { slug },
    {
      $set: {
        name: data.name,
        slug,
        breed: data.breed || '',
        species: data.species,
        gender: data.gender,
        age: data.age ?? 0,
        weight: data.weight ?? 0,
        color: data.color || '',
        price: data.price,
        description: data.description || '',
        image: data.image,
        gallery: data.gallery || [],
        vaccination: data.vaccination || false,
        healthStatus: data.healthStatus || '',
        isFeatured: data.isFeatured || false,
        microchipId: data.microchipId || '',
        adoptionStatus: data.adoptionStatus || ADOPTION_STATUS.AVAILABLE,
        status: data.status || RECORD_STATUS.ACTIVE,
      },
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return pet;
}

async function seed() {
  await connectDB();

  const forceFlag = process.argv.includes('--force');
  const existingCount = await Pet.countDocuments();

  if (existingCount > 0 && !forceFlag) {
    console.log(`[Seed] Hiện đã có ${existingCount} thú cưng trong collection "pets".`);
    const answer = await askConfirmation(
      `[Seed] Cập nhật lại ${SEED_PETS.length} thú cưng mẫu (upsert theo slug, KHÔNG xóa dữ liệu cũ)? (yes/no): `
    );
    if (answer !== 'yes') {
      console.log('[Seed] Đã hủy — không có gì thay đổi.');
      await mongoose.disconnect();
      process.exit(0);
    }
  }

  let count = 0;
  // eslint-disable-next-line no-restricted-syntax
  for (const data of SEED_PETS) {
    // eslint-disable-next-line no-await-in-loop
    await upsertPetBySlug(data);
    count += 1;
  }

  console.log(`[Seed] Đã upsert thành công ${count} thú cưng (giữ nguyên _id nếu đã tồn tại, không đụng Pet do Admin tự tạo).`);

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('[Seed] Lỗi:', err.message);
  process.exit(1);
});
