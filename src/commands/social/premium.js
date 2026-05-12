const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('premium')
        .setDescription('Kiểm tra tình trạng Premium của bản thân'),

    async execute(ctx, client) {
        const isPremium = await db.get(`premium_${ctx.user.id}`);
        const expireDate = await db.get(`premium_expire_${ctx.user.id}`);

        if (!isPremium) {
            return ctx.reply('❌ Bạn hiện chưa có quyền **Premium**. Hãy liên hệ Admin để nâng cấp!', 'info');
        }

        const timeLeft = expireDate - Date.now();
        if (timeLeft <= 0) {
            await db.delete(`premium_${ctx.user.id}`);
            return ctx.reply('⌛ Quyền Premium của bạn đã hết hạn!', 'error');
        }

        const embed = new EmbedBuilder()
            .setTitle('💎 TRẠNG THÁI PREMIUM 💎')
            .setDescription(`Chào **${ctx.user.username}**, bạn đang sở hữu đặc quyền Premium!`)
            .addFields(
                { name: '📅 Ngày hết hạn', value: `<t:${Math.floor(expireDate / 1000)}:F>`, inline: false },
                { name: '⏳ Còn lại', value: `<t:${Math.floor(expireDate / 1000)}:R>`, inline: false }
            )
            .setColor(0xffd700);

        await ctx.reply({ embeds: [embed] });
    }
};
