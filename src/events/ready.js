const { REST, Routes } = require('discord.js');
const chalk = require('chalk');

module.exports = {
    name: 'ready',
    once: true,
    async execute(client) {
        console.log(chalk.green.bold(`[ONLINE] Khởi động thành công! Bot đã đăng nhập với tên: ${client.user.tag}`));

        const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

        try {
            console.log(chalk.yellow('[API] Đang đồng bộ hóa Slash Commands (/) toàn cầu...'));

            const commandsData = client.commands.map(cmd => cmd.data.toJSON());

            await rest.put(
                Routes.applicationCommands(client.user.id),
                { body: commandsData }
            );

            console.log(chalk.green.bold(`[API] Đã đồng bộ thành công ${commandsData.length} Slash Commands!`));
        } catch (error) {
            console.error(chalk.red('[API ERROR] Lỗi khi đồng bộ Slash Commands:'), error);
        }
    }
};
