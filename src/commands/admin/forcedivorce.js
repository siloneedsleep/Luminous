const { SlashCommandBuilder } = require('discord.js');
const db = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('forcedivorce')
        .setDescription('Lệnh đặc quyền: Cưỡng chế ly hôn cho một cặp đôi')
        .addUserOption(opt => opt.setName('user').setRequired(true).setDescription('Một trong hai người muốn cưỡng chế')),

    async execute(ctx, client) {
        // Kiểm tra quyền Owner
        if (ctx.user.id !== '914831312295165982') {
            return ctx.reply('⛔ Lệnh này chỉ dành cho <@914831312295165982>!', 'error');
        }

        const user1 = ctx.options.getUser(0);
        const user2Id = await db.get(`partner_${user1.id}`);

        if (!user2Id) return ctx.reply(`⚠️ Người này hiện đang độc thân, không cần cưỡng chế!`, 'error');

        // Xóa dữ liệu cả 2 bên
        await db.delete(`partner_${user1.id}`);
        await db.delete(`partner_${user2Id}`);
        await db.delete(`marry_date_${user1.id}`);
        await db.delete(`marry_date_${user2Id}`);

        await ctx.reply(`⚡ <@914831312295165982> đã xóa tan cuộc hôn nhân của **${user1.username}** và đối phương!`, 'success');
    }
};
