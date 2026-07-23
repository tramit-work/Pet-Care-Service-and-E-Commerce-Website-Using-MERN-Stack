const mongoose = require('mongoose');

async function connectDB() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error('[MongoDB] Thiếu biến môi trường MONGO_URI. Vui lòng kiểm tra file .env');
    process.exit(1);
  }

  try {
    mongoose.set('strictQuery', true);

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log(`[MongoDB] Kết nối thành công: ${conn.connection.host}/${conn.connection.name}`);

    mongoose.connection.on('error', (err) => {
      console.error(`[MongoDB] Lỗi kết nối sau khi đã connect: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('[MongoDB] Kết nối đã bị ngắt.');
    });
  } catch (error) {
    console.error(`[MongoDB] Kết nối thất bại: ${error.message}`);
    process.exit(1);
  }
}

module.exports = connectDB;
