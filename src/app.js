require('dotenv').config();
const { Client, Intents } = require('discord.js');
const { Player, RepeatMode } = require('discord-music-player');
const { regExpPlaylist } = require('./regExp');

const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES],
});

const MODE_MUSIC = ['Chưa vào vòng lặp', 'Vòng lặp 1 bài ', 'Vòng lặp cả danh sách'];

const TOKEN = process.env.TOKEN_BOT;
const PREFIX = process.env.PREFIX;

const player = new Player(client, {
    leaveOnEmpty: false,
});

client.player = player;

client.on('ready', () => {
    console.log('Online !');
});

client.on('messageCreate', async (message) => {
    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/g);

    const command = args.shift();
    let guildQueue = client.player.getQueue(message.guild.id);

    if (command === 'p') {
        const keyword = args.join(' ');

        await message.reply('Đợi 1 xíu, bot đang search 😘');
        message.channel.sendTyping();
        let queue;
        try {
            queue = client.player.createQueue(message.guild.id, {
                data: message,
            });
            await queue.join(message.member.voice.channel);

            if (keyword.match(regExpPlaylist)) {
                await queue.playlist(keyword);
            } else {
                await queue.play(keyword);
            }
        } catch (error) {
            console.log(error);
            message.reply('Bot không đủ quyền để vào room đó :( ');
            if (!guildQueue) queue.stop();
        }
    }

    if (command === 'skip') {
        guildQueue.skip();
    }

    if (command === 'stop') {
        message.channel.send('Bot đi đây :((( ');
        guildQueue.stop();
    }

    if (command === 'removeLoop') {
        message.channel.send('Tắt vòng lặp thành công !');
        guildQueue.setRepeatMode(RepeatMode.DISABLED);
    }

    if (command === 'loop') {
        message.channel.send('Bật vòng lặp 1 bài thành công !');
        guildQueue.setRepeatMode(RepeatMode.SONG);
    }

    if (command === 'loopQueue') {
        message.channel.send('Bật vòng lặp cả danh sách thành công !');
        guildQueue.setRepeatMode(RepeatMode.QUEUE);
    }

    //queue
    if (command === 'q') {
        let listSong = [];

        if (!guildQueue) {
            message.reply('Hiện tại chưa có bài hát nào !');
            return;
        }

        const { repeatMode } = guildQueue;

        guildQueue.songs.forEach((element, i) => {
            listSong.push(`[${i + 1}] : ${element.name} - ${element.duration}`);
        });

        const count = listSong.length;

        if (count > 10) listSong.length = 10;

        const text = `\`\`\` Bài hát hiện tại: ${guildQueue.nowPlaying} \nChế độ hiện tại: ${
            MODE_MUSIC[repeatMode]
        } \n\n -----> ĐANG CÓ ${count} TRONG HÀNG ĐỢI <----- \n\n${listSong.join('\n')} \`\`\``;
        message.reply(text);
    }

    if (command === 'nowPlaying') {
        message.reply(`Bài hát hiện tại : **${guildQueue.nowPlaying}**`);
    }

    if (command === 'pause') {
        guildQueue.setPaused(true);
        message.reply('Dừng phát nhạc !');
    }

    if (command === 'resume') {
        guildQueue.setPaused(false);
        message.reply('Chạy lại nhạc rồi !');
    }

    if (command === 'help') {
        const a = [
            `Tiền tố để sử dụng BOT : ${PREFIX}`,
            'p {từ khoá|link youtube|playlist}: thêm nhạc',
            'q: danh sách nhạc',
            'skip: nhảy qua bài mới',
            'pause: dừng nhạc',
            'resume: tiếp tục nhạc',
            'stop: đuổi bot',
            'nowPlaying: nhạc phát hiện tại',
            'loop: chế độ lặp 1 bài',
            'loopQueue: chế độ lập cả danh sách',
            'removeLoop: xoá chế độ lặp',
        ];

        const text = ` \`\`\`${a.join('\n')}\`\`\``;
        message.reply(text);
    }
});

client.player.on('songAdd', (queue, song) => {
    queue.data.reply(`:notes: **${song}** đã được thêm vào hàng đợi `);
});

client.player.on('playlistAdd', (queue, song) => {
    queue.data.reply(`:notes: **${song}** đã được thêm vào hàng đợi `);
});

client.player.on('songChanged', (queue, newSong, oldSong) => {
    queue.data.channel.send(`:notes: **${newSong}** đang được phát `);
});

client.player.on('queueEnd', (queue) => {
    queue.data.channel.send('Hết nhạc rồi, BOT đi đây !');
});

client.player.on('clientDisconnect', (queue) => {
    queue.data.channel.send('Bot đi đây !');
});

client.login(TOKEN);
