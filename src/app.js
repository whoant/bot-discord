require('dotenv').config();
const { Client, Intents  } = require('discord.js');
const { getVoiceConnection, NoSubscriberBehavior, createAudioPlayer, createAudioResource, AudioPlayerStatus, getNextResource , joinVoiceChannel } = require('@discordjs/voice');
const { Player, RepeatMode } = require('discord-music-player');

const { regExpPlaylist } = require('./regExp');
const handleEvent = require('./handleEvent');

const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES],
});

const MODE_MUSIC = ['Chưa vào vòng lặp', 'Vòng lặp 1 bài ', 'Vòng lặp cả danh sách'];

const TOKEN = process.env.TOKEN_BOT;
const PREFIX = process.env.PREFIX;

const player = new Player(client, {
    leaveOnEmpty: false,
});

const queueTranslate = {
    connection: null,
    keywords: []
};

client.player = player;

client.on('ready', () => {
    console.log('Online !');
});

const nextVoice = () => {
    if (queueTranslate.keywords.length === 0) {
        queueTranslate.connection = null;
        return;
    }

    const player = createAudioPlayer({
        behaviors: {
            noSubscriber: NoSubscriberBehavior.Pause,
        },
    });
    queueTranslate.connection.subscribe(player);
    const text = queueTranslate.keywords[0];
    const resource = createAudioResource(`http://translate.google.com/translate_tts?tl=vi&q=${text}&client=tw-ob`);
    player.play(resource);
    player.on(AudioPlayerStatus.Idle, () => {
        queueTranslate.keywords.shift();
        nextVoice(player);
    });
}

client.on('messageCreate', async (message) => {
    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/g);
    let guildQueue = client.player.getQueue(message.guild.id);
    const command = args.shift();

    if (command === 'g') {
            const keyword = args.join(' ');
            queueTranslate.keywords.push(keyword);
            console.log(queueTranslate.keywords);
            if (queueTranslate.connection === null) {

                const queue = client.player.createQueue(message.guild.id);
                await queue.join(message.member.voice.channel);
                queueTranslate.connection = getVoiceConnection(message.guild.id);
                nextVoice();
            }
    }

    if (command === 'p') {
        const keyword = args.join(' ');
        await message.reply('Đợi 1 xíu, bot đang search 😘');
        message.channel.sendTyping();
        let queue;
        try {

            queue = client.player.createQueue(message.guild.id);
            await queue.join(message.member.voice.channel);
            let song;

            if (keyword.match(regExpPlaylist)) {
                song = await queue.playlist(keyword);
            } else {
                song = await queue.play(keyword);
            }

            song.setData({
                initMessage: message,
            });
        } catch (error) {
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

handleEvent(client);

client.login(TOKEN);
