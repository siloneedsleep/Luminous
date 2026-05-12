const { SlashCommandBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Yêu cầu bot rời khỏi kênh Voice'),

    async execute(ctx) {
        const connection = getVoiceConnection(ctx.guild.id);
        
        if (!connection) {
            return ctx.reply('⚠️ Bot hiện không có trong kênh voice nào.', 'error');
        }

        connection.destroy();
        await ctx.reply('👋 Đã rời kênh voice. Hẹn gặp lại!', 'success');
    }
};
