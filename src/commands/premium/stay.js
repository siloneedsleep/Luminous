const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');
const db = require('../../database/db');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stay')
        .setDescription('Lệnh Premium: Treo bot trong kênh Voice 24/7'),

    async execute(ctx, client) {
        const { member, guild, channel } = ctx;

        // 1. Check quyền Premium
        const isPre = await db.get(`premium_${member.id}`);
        const isOwner = member.id === '914831312295165982';
        
        if (!isPre && !isOwner) {
            return ctx.reply('💎 Tính năng này chỉ dành cho hội viên **Premium**!', 'error');
        }

        // 2. Check xem User có trong Voice không
        const voiceChannel = member.voice.channel;
        if (!voiceChannel) {
            return ctx.reply('⚠️ Bạn phải vào một kênh Voice trước!', 'error');
        }

        // 3. Thực hiện kết nối
        try {
            joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: guild.id,
                adapterCreator: guild.voiceAdapterCreator,
                selfDeaf: true, // Bot bị điếc để tiết kiệm băng thông
                selfMute: true  // Bot bị câm
            });

            // Lưu trạng thái vào DB để sau này nếu bot restart, nó tự quay lại (option nâng cao)
            await db.set(`stay_vc_${guild.id}`, voiceChannel.id);

            await ctx.reply(`🎙️ **Luminous** đã được treo 24/7 tại phòng: \`${voiceChannel.name}\``, 'success');
        } catch (error) {
            console.error(error);
            await ctx.reply('❌ Lỗi kết nối vào Voice!', 'error');
        }
    }
};
