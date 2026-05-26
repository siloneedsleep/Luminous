const { SlashCommandBuilder } = require('discord.js');
const LuminousEmbed = require('../../utils/EmbedBuilder');
const db = require('../../database/JsonManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('coinflip')
        .setDescription('Chơi tung đồng xu cá cược coin')
        .addIntegerOption(option => 
            option.setName('bet')
                .setDescription('Số coin bạn muốn cược')
                .setRequired(true)
        )
        .addStringOption(option => 
            option.setName('choice')
                .setDescription('Bạn chọn mặt ngửa (heads) hay mặt sấp (tails)?')
                .setRequired(true)
                .addChoices(
                    { name: 'Ngửa (Heads)', value: 'heads' },
                    { name: 'Sấp (Tails)', value: 'tails' }
                )
        ),
    async execute(ctx, args) {
        let betAmount;
        let choice;

        if (ctx.isSlash) {
            betAmount = ctx.interaction.options.getInteger('bet');
            choice = ctx.interaction.options.getString('choice');
        } else {
            if (args.length < 2) {
                return await ctx.reply({ embeds: [LuminousEmbed.error('Bạn vui lòng nhập số tiền cược và lựa chọn! Cú pháp: `l!coinflip 100 heads/tails`')] });
            }
            betAmount = parseInt(args[0]);
            choice = args[1].toLowerCase();

            if (choice !== 'heads' && choice !== 'tails') {
                return await ctx.reply({ embeds: [LuminousEmbed.error('Lựa chọn không hợp lệ! Hãy chọn `heads` (Ngửa) hoặc `tails` (Sấp).')] });
            }
        }

        if (isNaN(betAmount) || betAmount <= 0) {
            return await ctx.reply({ embeds: [LuminousEmbed.error('Số Star cược không hợp lệ!')] });
        }

        await ctx.deferReply();

        const userId = ctx.user.id;
        const balanceKey = `balance_${userId}`;
        const currentBalance = await db.get(balanceKey, 0);

        if (currentBalance < betAmount) {
            return await ctx.reply({ embeds: [LuminousEmbed.error(`Bạn không có đủ Star để cược! Số dư của bạn: **${currentBalance}** Star.`)] });
        }

        await db.set(balanceKey, currentBalance - betAmount);

        const outcomes = ['heads', 'tails'];
        const result = outcomes[Math.floor(Math.random() * outcomes.length)];
        const resultVN = result === 'heads' ? 'Ngửa' : 'Sấp';

        if (choice === result) {
            const winAmount = betAmount * 2;
            await db.set(balanceKey, (currentBalance - betAmount) + winAmount);
            
            const embed = LuminousEmbed.success(
                `Đồng xu ra mặt **${resultVN}**!\nChúc mừng bạn đã đoán đúng và nhận được **${winAmount}** Star.`
            );
            await ctx.reply({ embeds: [embed] });
        } else {
            const embed = LuminousEmbed.error(
                `Đồng xu ra mặt **${resultVN}**!\nRất tiếc, bạn đã đoán sai và mất đi **${betAmount}** Star.`
            );
            await ctx.reply({ embeds: [embed] });
        }
    }
};
