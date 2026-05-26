const { SlashCommandBuilder } = require('discord.js');
const LuminousEmbed = require('../../utils/EmbedBuilder');
const db = require('../../database/JsonManager');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('profile')
        .setDescription('Xem thẻ thông tin cá nhân của bạn hoặc người khác')
        .addUserOption(option => 
            option.setName('target')
                .setDescription('Người dùng bạn muốn xem hồ sơ')
                .setRequired(false)
        ),
    async execute(ctx, args) {
        let targetUser;

        if (ctx.isSlash) {
            targetUser = ctx.interaction.options.getUser('target') || ctx.user;
        } else {
            targetUser = ctx.message.mentions.users.first() || ctx.user;
        }

        await ctx.deferReply();

        const balanceKey = `balance_${targetUser.id}`;
        const levelKey = `level_${targetUser.id}`;

        const starBalance = await db.get(balanceKey, 0);
        const userLevel = await db.get(levelKey, 1);

        const embed = LuminousEmbed.info(
            `HỒ SƠ CỦA ${targetUser.username.toUpperCase()}`,
            `Dưới đây là thông tin chi tiết về tài khoản:`
        );

        embed.setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 256 }));
        
        embed.addFields(
            { name: '👤 Người dùng', value: `${targetUser} (\`${targetUser.id}\`)`, inline: false },
            { name: '⭐ Tài sản', value: `**${starBalance}** Star`, inline: true },
            { name: '📊 Cấp độ', value: `Cấp **${userLevel}**`, inline: true }
        );

        if (targetUser.id === '914831312295165982') {
            embed.addFields({ name: '👑 Danh hiệu', value: '`Project Owner / Developer`', inline: false });
        }

        await ctx.reply({ embeds: [embed] });
    }
};
