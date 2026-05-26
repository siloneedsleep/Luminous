const fs = require('fs');
const path = require('path');

class Loader {
    constructor(client) {
        this.client = client;
    }

    // Tự động quét và nạp toàn bộ lệnh (Commands)
    async loadCommands() {
        console.log('📂 Đang tải hệ thống Lệnh (Commands)...');
        let commandCount = 0;
        
        // Trỏ tới thư mục src/commands
        const commandsPath = path.join(__dirname, '../commands');

        // Nếu chưa có thư mục thì tự động tạo luôn cho sếp đỡ phải tạo tay
        if (!fs.existsSync(commandsPath)) {
            fs.mkdirSync(commandsPath, { recursive: true });
        }

        // Đọc các thư mục con (admin, economy, social...)
        const commandCategories = fs.readdirSync(commandsPath);

        for (const category of commandCategories) {
            const categoryPath = path.join(commandsPath, category);
            
            // Bỏ qua nếu nó không phải là thư mục
            if (!fs.statSync(categoryPath).isDirectory()) continue;

            // Quét các file .js trong thư mục con
            const commandFiles = fs.readdirSync(categoryPath).filter(file => file.endsWith('.js'));

            for (const file of commandFiles) {
                const filePath = path.join(categoryPath, file);
                const command = require(filePath);

                // Kiểm tra xem lệnh có viết đúng cấu trúc chuẩn không
                if ('data' in command && 'execute' in command) {
                    this.client.commands.set(command.data.name, command);
                    commandCount++;
                } else {
                    console.log(`[⚠️ CẢNH BÁO] Bỏ qua file ${file} vì thiếu 'data' hoặc 'execute'.`);
                }
            }
        }
        console.log(`✅ Đã nạp thành công ${commandCount} lệnh vào hệ thống!`);
    }

    // Tự động quét và nạp toàn bộ sự kiện (Events)
    async loadEvents() {
        console.log('📡 Đang tải hệ thống Sự kiện (Events)...');
        let eventCount = 0;
        
        // Trỏ tới thư mục src/events
        const eventsPath = path.join(__dirname, '../events');

        if (!fs.existsSync(eventsPath)) {
            fs.mkdirSync(eventsPath, { recursive: true });
        }

        const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

        for (const file of eventFiles) {
            const filePath = path.join(eventsPath, file);
            const event = require(filePath);

            // Phân biệt sự kiện chạy 1 lần (once) và sự kiện chạy liên tục (on)
            if (event.once) {
                this.client.once(event.name, (...args) => event.execute(...args, this.client));
            } else {
                this.client.on(event.name, (...args) => event.execute(...args, this.client));
            }
            eventCount++;
        }
        console.log(`✅ Đã thiết lập thành công ${eventCount} bộ lắng nghe sự kiện!`);
    }
}

module.exports = Loader;
