const { SlashCommandBuilder } = require('discord.js');
const LuminousEmbed = require('../../utils/EmbedBuilder');
const db = require('../../database/JsonManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('work')
        .setDescription('Làm việc để kiếm Star'),
    async execute(ctx, args) {
        await ctx.deferReply();

        const userId = ctx.user.id;
        const cooldownKey = `work_cooldown_${userId}`;
        const balanceKey = `balance_${userId}`;
        
        const lastWork = await db.get(cooldownKey, 0);
        const now = Date.now();
        const cooldownAmount = 60 * 60 * 1000; 

        if (now - lastWork < cooldownAmount) {
            const timeLeft = cooldownAmount - (now - lastWork);
            const minutes = Math.floor(timeLeft / (1000 * 60));
            const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
            
            return await ctx.reply({ 
                embeds: [LuminousEmbed.error(`Bạn đang kiệt sức! Vui lòng quay lại làm việc sau **${minutes} phút ${seconds} giây**.`)] 
            });
        }

        const jobs = [
            'làm bình luận viên giải đấu Free Fire',
            'cày thuê rank CODM',
            'thiết lập loa Google Nest Mini cho khách',
            'tùy chỉnh kết nối tay cầm PS5 DualSense',
            'viết code bot Discord bằng JavaScript',
            'giải bài tập toán hình học',
            'sáng tác thơ cổ phong'
        ];
        
        const randomJob = jobs[Math.floor(Math.random() * jobs.length)];
        const reward = Math.floor(Math.random() * 300) + 100; 

        const currentBalance = await db.get(balanceKey, 0);
        
        await db.set(balanceKey, currentBalance + reward);
        await db.set(cooldownKey, now);

        const embed = LuminousEmbed.success(
            `Bạn đã đi **${randomJob}** và kiếm được **${reward}** Star!\nSố dư hiện tại: **${currentBalance + reward}** Star.`
        );

        await ctx.reply({ embeds: [embed] });
    }
};
