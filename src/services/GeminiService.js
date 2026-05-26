const { GoogleGenerativeAI } = require('@google/generative-ai');
const chalk = require('chalk');

class GeminiService {
    constructor() {
        if (!process.env.GEMINI_KEY) {
            console.warn(chalk.yellow('[WARNING] Chưa cấu hình GEMINI_KEY trong file .env'));
            return;
        }
        this.genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    }

    async generateResponse(prompt) {
        if (!this.model) return '❌ API Key Gemini chưa được thiết lập.';
        
        try {
            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error(chalk.red('[GEMINI ERROR] Lỗi khi tạo phản hồi:'), error);
            return '❌ Đã xảy ra lỗi khi kết nối với máy chủ AI.';
        }
    }
}

module.exports = new GeminiService();
