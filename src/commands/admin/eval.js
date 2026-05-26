const { SlashCommandBuilder } = require('discord.js');
const LuminousEmbed = require('../../utils/EmbedBuilder');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('eval')
        .setDescription('Thực thi mã JavaScript trực tiếp (Chỉ dành cho Owner)')
        .addStringOption(option => 
            option.setName('code')
                .setDescription('Đoạn mã cần thực thi')
                .setRequired(true)
        ),
    async execute(ctx, args) {
        const ownerId = '914831312295165982';

        if (ctx.user.id !== ownerId) {
            return await ctx.reply({ embeds: [LuminousEmbed.error('Bạn không có quyền sử dụng lệnh này, chỉ Owner mới có thể thực thi mã!')] });
        }

        let code;
        if (ctx.isSlash) {
            code = ctx.interaction.options.getString('code');
        } else {
            code = args.join(' ');
        }

        if (!code) {
            return await ctx.reply({ embeds: [LuminousEmbed.error('Bạn vui lòng nhập đoạn mã cần thực thi!')] });
        }

        await ctx.deferReply();

        try {
            let evaled = await eval(code);
            
            if (typeof evaled !== 'string') {
                evaled = require('util').inspect(evaled, { depth: 0 });
            }
            
            const output = evaled.length > 1900 ? 'Kết quả quá dài để hiển thị trên Discord.' : evaled;

            const embed = LuminousEmbed.success('Thực thi mã thành công!')
                .addFields({ name: '📤 Đầu ra (Output)', value: `\`\`\`js\n${output}\n\`\`\`` });

            await ctx.reply({ embeds: [embed] });
        } catch (error) {
            const embed = LuminousEmbed.error('Có lỗi xảy ra khi thực thi!')
                .addFields({ name: '❌ Lỗi (Error)', value: `\`\`\`js\n${error}\n\`\`\`` });
            
            await ctx.reply({ embeds: [embed] });
        }
    }
};
