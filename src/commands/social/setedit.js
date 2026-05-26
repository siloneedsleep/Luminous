const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../database/db');
const { sendEmbed } = require('../../utils/embedWrapper');
const { rings } = require('../../utils/items');
const { executeHybrid, getAllArgs } = require('../../utils/hybridHandler');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setedit')
        .setDescription('Chỉnh sửa profile của bạn (note, status)')
        .addStringOption(option =>
            option
                .setName('type')
                .setDescription('Loại chỉnh sửa')
                .setRequired(true)
                .addChoices(
                    { name: 'Note', value: 'note' },
                    { name: 'Status', value: 'status' }
                )
        )
        .addStringOption(option =>
            option
                .setName('content')
                .setDescription('Nội dung mới (để trống để xóa)')
                .setRequired(false)
        ),

    async execute(ctx) {
        return executeHybrid(ctx, async (interaction, isSlash) => {
            try {
                // Defer reply
                if (!interaction.deferred && !interaction.replied) {
                    await interaction.deferReply({ ephemeral: true });
                }

                let type, content;

                if (isSlash) {
                    // Slash command
                    type = interaction.options.getString('type');
                    content = interaction.options.getString('content') || '';
                } else {
                    // Prefix command: !setedit <type> [content...]
                    const args = interaction.content.split(/\s+/).slice(1);
                    type = args[0]?.toLowerCase();
                    content = args.slice(1).join(' ') || '';

                    if (!type || !['note', 'status'].includes(type)) {
                        return await sendEmbed(interaction, '❌ Sử dụng: `!setedit <note|status> [nội dung]`', 'error');
                    }
                }

                // Validate type
                if (!['note', 'status'].includes(type)) {
                    return await sendEmbed(interaction, '❌ Loại chỉnh sửa không hợp lệ (note hoặc status)', 'error');
                }

                // Validate content length
                if (content.length > 500) {
                    return await sendEmbed(interaction, '❌ Nội dung không được vượt quá 500 ký tự', 'error');
                }

                const userId = interaction.user.id;
                const dbKey = type === 'note' ? `profile_note_${userId}` : `profile_status_${userId}`;

                // Update database
                if (content.trim()) {
                    await db.set(dbKey, content);
                    
                    const displayType = type === 'note' ? '📝 Note' : '✨ Status';
                    return await sendEmbed(
                        interaction,
                        `✅ Cập nhật ${displayType} thành công!\n\n\`\`\`${content}\`\`\``,
                        'success'
                    );
                } else {
                    // Clear if empty
                    await db.delete(dbKey);
                    
                    const displayType = type === 'note' ? '📝 Note' : '✨ Status';
                    return await sendEmbed(
                        interaction,
                        `✅ Đã xóa ${displayType}`,
                        'success'
                    );
                }

            } catch (error) {
                console.error('❌ Lỗi trong lệnh setedit:', error);
                await sendEmbed(interaction, '❌ Có lỗi xảy ra khi cập nhật profile', 'error').catch(() => null);
            }
        });
    }
};
