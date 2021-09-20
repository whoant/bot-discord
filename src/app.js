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
            message.reply('Bot không đủ quyền để vào room đó 😌');
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

    if (command === 'getQueue') {
        console.log(guildQueue.songs[0].name);
    }

    if (command === 'getVolume') {
        console.log(guildQueue.volume);
    }

    if (command === 'nowPlaying') {
        console.log(`Now playing: ${guildQueue.nowPlaying}`);
    }

    if (command === 'pause') {
        guildQueue.setPaused(true);
    }

    if (command === 'resume') {
        guildQueue.setPaused(false);
    }

    if (command === 'remove') {
        guildQueue.remove(parseInt(args[0]));
    }
});

client.player.on('songAdd', (queue, song) => {
    queue.data.reply(`**${song}** đã thêm vào danh sách`);
});

client.login(TOKEN);
