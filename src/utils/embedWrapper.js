const { EmbedBuilder } = require('discord.js');

/**
 * Hàm bọc Embed dùng chung cho toàn bộ Luminous Bot
 * @param {Object} ctx - Message hoặc Interaction
 * @param {string} content - Nội dung thông báo
 * @param {string} type - 'success', 'error', hoặc 'info'
 */
async function sendEmbed(ctx, content, type = 'info') {
    const colors = {
        info: 0x2b2d31,    // Màu xám đen sang trọng
        success: 0x00ff00, // Xanh lá
        error: 0xff0000    // Đỏ
    };

    const embed = new EmbedBuilder()
        .setDescription(content)
        .setColor(colors[type] || colors.info)
        .setTimestamp();

    // Hỗ trợ Hybrid: Kiểm tra xem là Interaction hay Message
    if (ctx.replied || ctx.deferred) {
        return await ctx.editReply({ embeds: [embed] });
    }
    
    if (typeof ctx.reply === 'function') {
        return await ctx.reply({ embeds: [embed] }).catch(() => null);
    } else {
        return await ctx.channel.send({ embeds: [embed] }).catch(() => null);
    }
}

module.exports = { sendEmbed };
