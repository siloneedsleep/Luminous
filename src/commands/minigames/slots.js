const { SlashCommandBuilder } = require('discord.js');
const LuminousEmbed = require('../../utils/EmbedBuilder');
const db = require('../../database/JsonManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slots')
        .setDescription('Chơi máy quay đổi thưởng (Slots)')
        .addIntegerOption(option => 
            option.setName('bet')
                .setDescription('Số Star bạn muốn cược')
                .setRequired(true)
        ),
    async execute(ctx, args) {
        let betAmount;

        if (ctx.isSlash) {
            betAmount = ctx.interaction.options.getInteger('bet');
        } else {
            if (args.length < 1) {
                return await ctx.reply({ embeds: [LuminousEmbed.error('Bạn vui lòng nhập số Star cược! Cú pháp: `l!slots 100`')] });
            }
            betAmount = parseInt(args[0]);
        }

        if (isNaN(betAmount) || betAmount <= 0) {
            return await ctx.reply({ embeds: [LuminousEmbed.error('Số Star cược không hợp lệ! Vui lòng nhập số lớn hơn 0.')] });
        }

        await ctx.deferReply();

        const userId = ctx.user.id;
        const balanceKey = `balance_${userId}`;
        const currentBalance = await db.get(balanceKey, 0);

        if (currentBalance < betAmount) {
            return await ctx.reply({ embeds: [LuminousEmbed.error(`Bạn không có đủ tiền để cược! Số dư của bạn: **${currentBalance}** Star.`)] });
        }

        const symbols = ['🍎', '🍇', '🍊', '🔔', '💎', '7️⃣'];
        const slot1 = symbols[Math.floor(Math.random() * symbols.length)];
        const slot2 = symbols[Math.floor(Math.random() * symbols.length)];
        const slot3 = symbols[Math.floor(Math.random() * symbols.length)];

        let multiplier = 0;
        let resultText = '';

        if (slot1 === slot2 && slot2 === slot3) {
            if (slot1 === '7️⃣') multiplier = 10;
            else if (slot1 === '💎') multiplier = 7;
            else multiplier = 5;
            resultText = '🎉 CHÚC MỪNG! BẠN ĐÃ TRÚNG JACKPOT!';
        } else if (slot1 === slot2 || slot2 === slot3 || slot1 === slot3) {
            multiplier = 2;
            resultText = '✨ Chúc mừng! Bạn đã trúng giải nhỏ!';
        } else {
            resultText = '😢 Rất tiếc! Bạn chưa trúng thưởng lần này.';
        }

        const winAmount = betAmount * multiplier;
        let newBalance = currentBalance - betAmount;

        if (multiplier > 0) {
            newBalance += winAmount;
        }

        await db.set(balanceKey, newBalance);

        const embed = LuminousEmbed.info(
            '🎰 MÁY QUAY THƯỞNG 🎰',
            `**[ ${slot1} | ${slot2} | ${slot3} ]**\n\n${resultText}`
        );

        if (multiplier > 0) {
            embed.setColor('#57F287');
            embed.addFields({ name: 'Kết quả', value: `Bạn đã thắng **${winAmount}** Star!` });
        } else {
            embed.setColor('#ED4245');
            embed.addFields({ name: 'Kết quả', value: `Bạn đã thua **${betAmount}** Star.` });
        }

        embed.setFooter({ text: `Số dư hiện tại: ${newBalance} Star` });

        await ctx.reply({ embeds: [embed] });
    }
};
