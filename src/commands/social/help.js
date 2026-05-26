const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { executeHybrid } = require('../../utils/hybridHandler');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('help')
        .setDescription('Hiển thị danh sách các lệnh và hướng dẫn sử dụng')
        .addStringOption(option =>
            option
                .setName('category')
                .setDescription('Chọn danh mục lệnh')
                .setRequired(false)
                .addChoices(
                    { name: 'Social', value: 'social' },
                    { name: 'Economy', value: 'economy' },
                    { name: 'Admin', value: 'admin' },
                    { name: 'Premium', value: 'premium' }
                )
        ),

    async execute(ctx, client) {
        return executeHybrid(ctx, async (interaction, isSlash) => {
            try {
                // Cache kiểm tra nếu interaction đã expiry trước
                if (!interaction.deferred && !interaction.replied) {
                    await interaction.deferReply({ ephemeral: true });
                }

                let category;

                if (isSlash) {
                    category = interaction.options.getString('category') || 'all';
                } else {
                    // Prefix: !help [category]
                    const args = interaction.content.split(/\s+/).slice(1);
                    category = args[0]?.toLowerCase() || 'all';
                }

                const embeds = this.generateHelpEmbeds(client, category);

                if (embeds.length === 0) {
                    return await interaction.editReply({
                        content: '❌ Không tìm thấy danh mục lệnh này.',
                        ephemeral: true
                    });
                }

                // Optimize: Phân trang cho hosting (giảm payload)
                const row = this.createNavigationButtons(embeds.length);
                let currentPage = 0;

                const message = await interaction.editReply({
                    embeds: [embeds[currentPage]],
                    components: embeds.length > 1 ? [row] : [],
                    ephemeral: true
                });

                if (embeds.length <= 1) return;

                // Collector filter với timeout ngắn cho hosting
                const collector = message.createMessageComponentCollector({
                    filter: i => i.user.id === interaction.user.id,
                    time: 60000 // 1 phút timeout
                });

                collector.on('collect', async buttonInteraction => {
                    if (!buttonInteraction.isButton()) return;

                    if (buttonInteraction.customId === 'help_prev') {
                        currentPage = (currentPage - 1 + embeds.length) % embeds.length;
                    } else if (buttonInteraction.customId === 'help_next') {
                        currentPage = (currentPage + 1) % embeds.length;
                    }

                    await buttonInteraction.deferUpdate().catch(() => null);
                    
                    await message.edit({
                        embeds: [embeds[currentPage]],
                        components: [row]
                    }).catch(() => null);
                });

                // Cleanup khi timeout
                collector.on('end', () => {
                    message.edit({
                        components: []
                    }).catch(() => null);
                });

            } catch (error) {
                console.error('❌ Lỗi trong lệnh help:', error);
                
                const errorReply = {
                    content: '❌ Có lỗi xảy ra khi xử lý yêu cầu của bạn. Vui lòng thử lại sau.',
                    ephemeral: true
                };

                try {
                    if (interaction.deferred || interaction.replied) {
                        await interaction.editReply(errorReply);
                    } else {
                        await interaction.reply(errorReply);
                    }
                } catch (e) {
                    console.error('Không thể gửi error message:', e);
                }
            }
        });
    },

    generateHelpEmbeds(client, category = 'all') {
        const embeds = [];
        const categoryMap = {
            social: '👥 Lệnh Xã Hội',
            economy: '💰 Lệnh Kinh Tế',
            admin: '⚙️ Lệnh Quản Trị',
            premium: '⭐ Lệnh Premium'
        };

        const commandsByCategory = this.groupCommandsByCategory(client);

        if (category === 'all') {
            Object.entries(commandsByCategory).forEach(([cat, commands]) => {
                const embed = new (require('discord.js')).EmbedBuilder()
                    .setTitle(`${categoryMap[cat] || cat}`)
                    .setColor(this.getCategoryColor(cat))
                    .setFooter({ text: `Trang 1 | Tổng: ${Object.keys(commandsByCategory).length} danh mục` })
                    .setTimestamp();

                commands.slice(0, 5).forEach(cmd => {
                    embed.addFields({
                        name: `\`/${cmd.data.name}\``,
                        value: cmd.data.description || 'Không có mô tả',
                        inline: true
                    });
                });

                embeds.push(embed);
            });
        } else {
            const commands = commandsByCategory[category] || [];
            if (commands.length === 0) return [];

            const chunkedCommands = this.chunkArray(commands, 6);
            
            chunkedCommands.forEach((chunk, index) => {
                const embed = new (require('discord.js')).EmbedBuilder()
                    .setTitle(`${categoryMap[category] || category}`)
                    .setColor(this.getCategoryColor(category))
                    .setFooter({ text: `Trang ${index + 1}/${chunkedCommands.length}` })
                    .setTimestamp();

                chunk.forEach(cmd => {
                    embed.addFields({
                        name: `\`/${cmd.data.name}\``,
                        value: cmd.data.description || 'Không có mô tả',
                        inline: false
                    });
                });

                embeds.push(embed);
            });
        }

        return embeds;
    },

    groupCommandsByCategory(client) {
        const grouped = {
            social: [],
            economy: [],
            admin: [],
            premium: []
        };

        client.commands.forEach(command => {
            const category = command.category || 'social';
            if (grouped[category]) {
                grouped[category].push(command);
            } else {
                grouped.social.push(command);
            }
        });

        return grouped;
    },

    getCategoryColor(category) {
        const colors = {
            social: '#00B4D8',
            economy: '#06FFA5',
            admin: '#FF6B6B',
            premium: '#FFD60A'
        };
        return colors[category] || '#808080';
    },

    createNavigationButtons() {
        return new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('help_prev')
                .setLabel('⬅️ Trước')
                .setStyle(ButtonStyle.Secondary),
            new ButtonBuilder()
                .setCustomId('help_next')
                .setLabel('Sau ➡️')
                .setStyle(ButtonStyle.Secondary)
        );
    },

    chunkArray(array, size) {
        const chunks = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }
};
