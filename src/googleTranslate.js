require('dotenv').config();
const { Client, Intents } = require('discord.js');
const {
    getVoiceConnection,
    NoSubscriberBehavior,
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus,
} = require('@discordjs/voice');
const { Player } = require('discord-music-player');

const low = require('lowdb')

const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('db.json')
const db = low(adapter);
db.defaults({ filters: [] })
    .write();

const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILD_VOICE_STATES],
});

const TOKEN = process.env.TOKEN_BOT_TRANSLATE;
const PREFIX = process.env.PREFIX;

const player = new Player(client, {
    leaveOnEmpty: false,
});

const queueTranslate = {
    connection: null,
    keywords: [],
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
};

client.on('messageCreate', async (message) => {
    const text = message.content.toLowerCase();

    const checkFilter = checkKeyWords(text);

    if (checkFilter !== ''){

        message.reply(checkFilter);
    }

    if (!message.content.startsWith(PREFIX)) return;

    const args = message.content.slice(PREFIX.length).trim().split(/ +/g);
    const command = args.shift();

    if (command === 'g') {
        const keyword = args.join(' ');
        queueTranslate.keywords.push(keyword);
        if (queueTranslate.connection === null) {

            const queue = client.player.createQueue(message.guild.id);
            await queue.join(message.member.voice.channel);
            queueTranslate.connection = getVoiceConnection(message.guild.id);
            nextVoice();
        }
    }

    if (command === 'leave') {
        const guidId = message.guild.id;
        message.reply("Đi đây :( ");
        getVoiceConnection(guidId).disconnect();
    }

    if (command === 'filter') {

        if (message.author.id !== '600202809115410451') return;
        const keyword = args.join(' ');
        const [key, word] = keyword.split('>');
        db.get('filters').push({key: key.trim(), word: word.trim() }).write();
        message.reply("Thêm thành công :3");

    }

});


function checkKeyWords(text) {
    const listKey = db.get('filters').value();

    const filter = listKey.find(item => text.includes(item.key));
    console.log(filter);
    if (filter === undefined) return '';
    return filter.word;

}

client.login(TOKEN);

