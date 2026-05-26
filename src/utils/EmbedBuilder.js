const { EmbedBuilder } = require('discord.js');

class LuminousEmbed {
    /**
     * Tạo một thông báo lỗi
     * @param {string} message Nội dung lỗi
     * @returns {EmbedBuilder}
     */
    static error(message) {
        return new EmbedBuilder()
            .setColor('#ED4245')
            .setTitle('❌ Đã xảy ra lỗi')
            .setDescription(message)
            .setFooter({ text: 'Luminous Engine' })
            .setTimestamp();
    }

    /**
     * Tạo một thông báo thành công
     * @param {string} message Nội dung thành công
     * @returns {EmbedBuilder}
     */
    static success(message) {
        return new EmbedBuilder()
            .setColor('#57F287')
            .setTitle('✅ Thành công')
            .setDescription(message)
            .setFooter({ text: 'Luminous Engine' })
            .setTimestamp();
    }

    /**
     * Tạo một thông báo thông tin chung
     * @param {string} title Tiêu đề
     * @param {string} message Nội dung
     * @returns {EmbedBuilder}
     */
    static info(title, message) {
        return new EmbedBuilder()
            .setColor('#5865F2')
            .setTitle(title)
            .setDescription(message)
            .setFooter({ text: 'Luminous Engine' })
            .setTimestamp();
    }
}

module.exports = LuminousEmbed;
