const cp = require('child_process');
const path = require('path');

const botMusic = cp.fork(path.join(__dirname, 'botMusic.js'));
const botGoogle = cp.fork(path.join(__dirname, 'botGoogle.js'));