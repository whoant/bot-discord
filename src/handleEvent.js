module.exports = client => {
    client.player.on('songAdd', (queue, song) => {
        console.log(queue.nowPlaying.data);
        // queue.data.reply(`:notes: **${song}** đã được thêm vào hàng đợi `);
    });

    client.player.on('playlistAdd', (queue, song) => {
        // queue.data.reply(`:notes: **${song}** đã được thêm vào hàng đợi `);
    });

    client.player.on('songChanged', (queue, newSong, oldSong) => {
        queue.data.channel.send(`:notes: **${newSong}** đang được phát `);
    });

    client.player.on('queueEnd', (queue) => {
        queue.data.channel.send('Hết nhạc rồi, BOT đi đây !');
    });

    // client.player.on('clientDisconnect', (queue) => {
    //     queue.data.channel.send('Bot đi đây !');
    // });
}