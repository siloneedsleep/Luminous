const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../../database/db');
const { sendEmbed } = require('../../utils/embedWrapper');
const { rings } = require('../../utils/items');
const { executeHybrid } = require('../../utils/hybridHandler');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Xem ví tiền, ngân hàng, status và hôn nhân')
        .addUserOption(option =>
            option
                .setName('user')
                .setDescription('Xem profile người khác (cần Premium)')
                .setRequired(false)
        ),

    async execute(ctx) {
        return executeHybrid(ctx, async (interaction, isSlash) => {
            try {
                // Defer reply để tránh timeout khi query DB
                if (!interaction.deferred && !interaction.replied) {
                    await interaction.deferReply({ ephemeral: false });
                }

                let target;

                if (isSlash) {
                    target = interaction.options.getUser('user') || interaction.user;
                } else {
                    // Prefix: !profile [@user]
                    target = interaction.mentions.users.first() || interaction.user;
                }
                
                // Check Premium khi soi người khác
                if (target.id !== interaction.user.id) {
                    const isPre = await Promise.race([
                        db.get(`premium_${interaction.user.id}`),
                        new Promise((_, reject) => setTimeout(() => reject(new Error('DB timeout')), 5000))
                    ]).catch(() => false);

                    const isOwner = interaction.user.id === process.env.OWNER_ID || interaction.user.id === '914831312295165982';
                    
                    if (!isPre && !isOwner) {
                        return await sendEmbed(interaction, '⚠️ Soi ví người khác cần có **Premium**!', 'error');
                    }
                }

                // --- Lấy toàn bộ dữ liệu tài chính với timeout ---
                const [cash, bank, partnerId, ringId, isPremium, note, status] = await Promise.all([
                    Promise.race([db.get(`money_${target.id}`), new Promise((_, r) => setTimeout(() => r(0), 3000))]).catch(() => 0),
                    Promise.race([db.get(`bank_${target.id}`), new Promise((_, r) => setTimeout(() => r(0), 3000))]).catch(() => 0),
                    Promise.race([db.get(`partner_${target.id}`), new Promise((_, r) => setTimeout(() => r(null), 3000))]).catch(() => null),
                    Promise.race([db.get(`couple_ring_${target.id}`), new Promise((_, r) => setTimeout(() => r(null), 3000))]).catch(() => null),
                    Promise.race([db.get(`premium_${target.id}`), new Promise((_, r) => setTimeout(() => r(false), 3000))]).catch(() => false),
                    Promise.race([db.get(`profile_note_${target.id}`), new Promise((_, r) => setTimeout(() => r(null), 3000))]).catch(() => null),
                    Promise.race([db.get(`profile_status_${target.id}`), new Promise((_, r) => setTimeout(() => r(null), 3000))]).catch(() => null)
                ]);

                const total = (cash || 0) + (bank || 0);
                const ringInfo = rings.find(r => r.id === ringId);

                const embed = new EmbedBuilder()
                    .setTitle(`🌟 HỒ SƠ: ${target.username.toUpperCase()} 🌟`)
                    .setThumbnail(target.displayAvatarURL({ dynamic: true }))
                    .setColor(ringInfo ? ringInfo.color : 0x2b2d31)
                    .addFields(
                        { 
                            name: '💰 TÀI CHÍNH', 
                            value: `💵 Ví: \`${(cash || 0).toLocaleString()}$\`\n🏦 Ngân hàng: \`${(bank || 0).toLocaleString()}$\`\n📊 Tổng: \`${total.toLocaleString()}$\``, 
                            inline: false 
                        },
                        { 
                            name: '💍 HÔN NHÂN', 
                            value: partnerId ? `👤 Bạn đời: <@${partnerId}>\n✨ Nhẫn: ${ringInfo ? `${ringInfo.emoji} ${ringInfo.name}` : 'Không có'}` : '🔓 Chủ nghĩa độc thân', 
                            inline: true 
                        }
                    );

                // Thêm status nếu có
                if (status) {
                    embed.addFields({
                        name: '✨ Status',
                        value: `> ${status}`,
                        inline: false
                    });
                }

                // Thêm note nếu có
                if (note) {
                    embed.addFields({
                        name: '📝 Note',
                        value: `> ${note}`,
                        inline: false
                    });
                }

                embed.setFooter({ text: `Luminous Economy • 2026` })
                    .setTimestamp();

                // Icon đặc biệt cho Owner hoặc Premium
                const isOwner = target.id === process.env.OWNER_ID || target.id === '914831312295165982';
                if (isOwner) {
                    embed.setAuthor({ name: '👑 Silo - Owner', iconURL: target.displayAvatarURL() });
                } else if (isPremium) {
                    embed.setAuthor({ name: '💎 Hội Viên Premium', iconURL: target.displayAvatarURL() });
                }

                await interaction.editReply({ embeds: [embed] });

            } catch (error) {
                console.error('❌ Lỗi trong lệnh profile:', error);
                await sendEmbed(interaction, '❌ Không thể lấy thông tin profile. Vui lòng thử lại sau.', 'error').catch(() => null);
            }
        });
    }
};
