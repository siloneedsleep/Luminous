require('dotenv').config();
const LuminousClient = require('./core/LuminousClient');

// ===========================================================
// HỆ THỐNG ANTI-CRASH (CHỐNG SẬP NGUỒN TOÀN CỤC)
// Bắt mọi lỗi văng ra ngoài hệ thống để bot không bao giờ bị tắt
// ===========================================================
process.on('unhandledRejection', (reason, promise) => {
    console.error('[ANTI-CRASH] Cảnh báo Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err, origin) => {
    console.error('[ANTI-CRASH] Cảnh báo Uncaught Exception:', err);
});

process.on('uncaughtExceptionMonitor', (err, origin) => {
    console.error('[ANTI-CRASH] Cảnh báo Uncaught Exception Monitor:', err);
});

// ===========================================================
// KHỞI ĐỘNG ĐỘNG CƠ LÕI (CORE ENGINE)
// ===========================================================
console.log('🚀 Đang khởi động Luminous Enterprise Engine v15...');

const client = new LuminousClient();
client.start(process.env.TOKEN);
