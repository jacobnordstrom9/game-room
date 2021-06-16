
const express = require('express');
const app = express();
const helmet = require('helmet');
const cookieSession = require('cookie-session');
const router = require('./routes/index');
const server = require('http').Server(app)
const io = require('socket.io')(server)
const { ExpressPeerServer } = require('peer')
const peerServer = ExpressPeerServer(server, {
	debug: true,
})
//! do this
const passport = require('passport');
let PORT = 3000;

//public
app.use(express.static('public'));
app.use(helmet());

//cookie-session 
app.use(cookieSession({
    name: 'session',
    keys: ['lskdfjl;sj;lasjdfl;ajsld;fjasl;djflasjdflsak'], 
    maxAge: 14 * 24  * 60 * 60 * 1000
}))

//views
app.set('view engine', 'ejs')
//! do this also
app.use(passport.initialize());
app.use(passport.session());

app.use(express.urlencoded({extended: false}));
app.use(express.json());

//routes 

app.use(require('./routes/login')) 
app.use(require('./routes/index'))

//app.use(require('./routes/registration'))

app.use('/peerjs', peerServer)
app.use(express.static('public'))
app.set('view engine', 'ejs')

app.use(require('./routes/'));

app.use(require('./routes/player'));

app.get('/', (req, res) => {
	res.redirect(`/${uuidv4()}`)
})

app.get('/:room', (req, res) => {
	res.render('room', { roomId: req.params.room })
})

io.on('connection', (socket) => {
	socket.on('join-room', (roomId, userId) => {
		socket.join(roomId)
		socket.to(roomId).broadcast.emit('user-connected', userId)

		socket.on('message', (message) => {
			io.to(roomId).emit('createMessage', message, userId)
		})
		socket.on('disconnect', () => {
			socket.to(roomId).broadcast.emit('user-disconnected', userId)
		})

	})
	
})

io.on('connection', function (socket) {
    console.log('a user connected');
	// create a new player and add it to our players object
players[socket.id] = {
	rotation: 0,
	x: Math.floor(Math.random() * 700) + 50,
	y: Math.floor(Math.random() * 500) + 50,
	playerId: socket.id,
	team: (Math.floor(Math.random() * 2) == 0) ? 'red' : 'blue'
};
  // send the players object to the new player
socket.emit('currentPlayers', players);
// send the star object to the new player
socket.emit('starLocation', star);
// send the current scores
socket.emit('scoreUpdate', scores);
// when a player moves, update the player data
socket.on('playerMovement', function (movementData) {
	players[socket.id].x = movementData.x;
	players[socket.id].y = movementData.y;
	players[socket.id].rotation = movementData.rotation;
	// emit a message to all players about the player that moved
	socket.broadcast.emit('playerMoved', players[socket.id]);

    socket.on('starCollected', function () {
    if (players[socket.id].team === 'red') {
    scores.red += 10;
    } else {
    scores.blue += 10;
    }
  star.x = Math.floor(Math.random() * 700) + 50;
  star.y = Math.floor(Math.random() * 500) + 50;
    io.emit('starLocation', star);
    io.emit('scoreUpdate', scores);
});
});
  // update all other players of the new player
socket.broadcast.emit('newPlayer', players[socket.id]);
    socket.on('disconnect', function () {
    console.log('user disconnected');
// remove this player from our players object
delete players[socket.id];
// emit a message to all players to remove this player
io.emit('disconnect', socket.id);


    });
});

	
var players = {};
var star = {
  x: Math.floor(Math.random() * 700) + 50,
  y: Math.floor(Math.random() * 500) + 50
};
var scores = {
    blue: 0,
    red: 0
};

app.listen(PORT, ()=>{
    console.log(`listening on port ${PORT}`);
})

module.exports = router;