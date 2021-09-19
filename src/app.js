require('dotenv').config();
const { Client } = require('discord.js');

const { joinVoiceChannel, createAudioPlayer, createAudioResource, StreamType } = require('@discordjs/voice');

const ytdl = require('ytdl-core-discord');
const ytSearch = require('yt-search');

const fs = require('fs');

const to = require('./to');
const { join } = require('path');

const PREFIX = process.env.PREFIX;

const client = new Client({
    intents: ['GUILDS', 'GUILD_MESSAGES', 'GUILD_VOICE_STATES'],
});

client.once('ready', () => {
    console.log(`${client.user.tag} has logged in !`);
});

client.on('messageCreate', async (message) => {
    const { content } = message;
    const voiceChannel = message.member.voice.channel;

    if (!content.startsWith(PREFIX) || message.author.bot) return;

    if (!voiceChannel) {
        return message.reply('Bạn phải trong phòng nghe mới được gọi !');
    }

    const [CMD_NAME, ...args] = content.trim().substring(PREFIX.length).split(' ');

    let link = args.join(' ');

    if (!ytdl.validateURL(link)) {
        const [err, info] = await to(ytSearch(link));

        if (err) {
            return message.reply('Không tìm thấy bài hát !');
        }

        link = info.videos[0].url;
    }

    const [err, info] = await to(ytdl.getInfo(link, { filter: 'audioonly' }));
    if (err) {
        return message.reply('Không tìm thấy bài hát !');
    }

    fs.writeFileSync('data.json', JSON.stringify(info));

    const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: message.guild.id,
        adapterCreator: message.guild.voiceAdapterCreator,
    });

    const player = createAudioPlayer();

    const { formats } = info;

    console.log(formats.length);
    const linkSound = formats[formats.length - 1].url;
    console.log(linkSound);

    // const resource = createAudioResource(join(__dirname, 'music2.mp3'), {
    //     // inputType: StreamType.WebmOpus,
    //     inlineVolume: true,
    // });
    const resource = createAudioResource(linkSound, {
        inputType: StreamType.WebmOpus,
        inlineVolume: true,
    });
    player.play(resource);

    connection.on('stateChange', (oldState, newState) => {
        console.log(`Connection transitioned from ${oldState.status} to ${newState.status}`);
    });

    player.on('stateChange', (oldState, newState) => {
        console.log(`Audio player transitioned from ${oldState.status} to ${newState.status}`);
    });

    player.on('error', (error) => {
        console.error('Error:', error.message, 'with track', error.resource.metadata.title);
    });

    connection.subscribe(player);
    message.reply(`:notes: **${info.videoDetails.title}** vào danh sách !`);
});

client.login(process.env.TOKEN_BOT);
