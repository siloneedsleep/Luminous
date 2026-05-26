const { SlashCommandBuilder } = require('discord.js');
const LuminousEmbed = require('../../utils/EmbedBuilder');
const db = require('../../database/JsonManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('daily')
        .setDescription('Nhận phần thưởng coin mỗi ngày'),
    async execute(ctx, args) {
        await ctx.deferReply();

        const userId = ctx.user.id;
        const cooldownKey = `daily_cooldown_${userId}`;
        const balanceKey = `balance_${userId}`;
        
        const lastClaim = await db.get(cooldownKey, 0);
        const now = Date.now();
        const cooldownAmount = 24 * 60 * 60 * 1000; 

        if (now - lastClaim < cooldownAmount) {
            const timeLeft = cooldownAmount - (now - lastClaim);
            const hours = Math.floor(timeLeft / (1000 * 60 * 60));
            const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
            
            return await ctx.reply({ 
                embeds: [LuminousEmbed.error(`Bạn đã nhận phần thưởng rồi! Vui lòng quay lại sau **${hours} giờ ${minutes} phút**.`)] 
            });
        }

        const reward = Math.floor(Math.random() * 500) + 500; 
        const currentBalance = await db.get(balanceKey, 0);
        
        await db.set(balanceKey, currentBalance + reward);
        await db.set(cooldownKey, now);

        const embed = LuminousEmbed.success(
            `Bạn đã nhận được **${reward}** Star phần thưởng điểm danh hàng ngày!\nSố dư hiện tại: **${currentBalance + reward}** Star.`
        );

        await ctx.reply({ embeds: [embed] });
    }
};
