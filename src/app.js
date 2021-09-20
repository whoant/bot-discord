require('dotenv').config();
const { Client, Intents } = require('discord.js');
const { Player, RepeatMode } = require('discord-music-player');

const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES],
});

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
        message.reply('Đợi 1 xíu, bot đang search 😘');

        try {
            let queue = client.player.createQueue(message.guild.id, {
                data: message,
            });
            await queue.join(message.member.voice.channel);

            let song = await queue.play(args.join(' ')).catch((_) => {
                if (!guildQueue) queue.stop();
            });
        } catch (error) {
            message.reply('Bot không đủ quyền để vào room đó :( ');
        }
    }

    if (command === 'playlist') {
        let queue = client.player.createQueue(message.guild.id);
        await queue.join(message.member.voice.channel);
        let song = await queue.playlist(args.join(' ')).catch((_) => {
            if (!guildQueue) queue.stop();
        });
    }

    if (command === 'skip') {
        guildQueue.skip();
    }

    if (command === 'stop') {
        guildQueue.stop();
    }

    if (command === 'removeLoop') {
        guildQueue.setRepeatMode(RepeatMode.DISABLED);
    }

    if (command === 'toggleLoop') {
        guildQueue.setRepeatMode(RepeatMode.SONG);
    }

    if (command === 'toggleQueueLoop') {
        guildQueue.setRepeatMode(RepeatMode.QUEUE);
    }

    if (command === 'setVolume') {
        guildQueue.setVolume(parseInt(args[0]));
    }

    if (command === 'seek') {
        guildQueue.seek(parseInt(args[0]) * 1000);
    }

    if (command === 'clearQueue') {
        guildQueue.clearQueue();
    }

    if (command === 'shuffle') {
        guildQueue.shuffle();
    }

    //queue
    if (command === 'q') {
        let listSong = [];

        if (!guildQueue) {
            message.reply('Hiện tại chưa có bài hát nào !');
            return;
        }

        guildQueue.songs.forEach((element, i) => {
            listSong.push(`[${i + 1}] : ${element.name} - ${element.duration}`);
        });

        const text = `\`\`\` Bài hát hiện tại: ${
            guildQueue.nowPlaying
        } \n\n -----> ĐANG TRONG HÀNG ĐỢI <----- \n\n${listSong.join('\n')} \`\`\``;
        message.reply(text);
    }

    if (command === 'getVolume') {
        console.log(guildQueue.volume);
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

    if (command === 'remove') {
        console.log(args[0]);
        guildQueue.remove(parseInt(args[0]));
    }

    if (command === 'help') {
        const text = ` \`\`\` p {từ khoá|link youtube}: thêm nhạc \n q: danh sách nhạc \n skip: nhảy qua bài mới \n pause: dừng nhạc \n resume: tiếp tục nhạc \n stop: đuổi bot \n nowPlaying: nhạc phát hiện tại \`\`\``;
        message.reply(text);
    }
});

client.player.on('songAdd', (queue, song) => {
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
