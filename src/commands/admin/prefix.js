const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const db = require('../../database/db');

module.exports = {
    // Phần data dành cho Slash Command
    data: new SlashCommandBuilder()
        .setName('prefix')
        .setDescription('Thay đổi prefix của bot cho server này')
        .addStringOption(option => 
            option.setName('new_prefix')
                .setDescription('Prefix mới bạn muốn đặt')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

    // Hàm execute dùng chung cho cả Slash và Prefix (Hybrid)
    async execute(ctx, client) {
        // Lấy prefix mới từ Slash Option hoặc từ đối số của Message
        const newPrefix = ctx.options.getString(0); 

        if (!newPrefix) {
            return ctx.reply('⚠️ Vui lòng cung cấp prefix mới!', 'error');
        }

        if (newPrefix.length > 5) {
            return ctx.reply('⚠️ Prefix không được dài quá 5 ký tự!', 'error');
        }

        // Lưu vào Quick.db
        await db.set(`prefix_${ctx.guild.id}`, newPrefix);

        // Phản hồi bọc Embed (sử dụng hàm sendEmbed đã tích hợp trong ctx.reply)
        await ctx.reply(`✅ Đã thay đổi prefix của server thành: \`${newPrefix}\``, 'success');
    }
};
