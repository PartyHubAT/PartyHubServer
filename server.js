//Import dependencies
const config = require('./config.json');
const path = require('path');
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const { gatewayIp } = require('./utils/ip');
const { LiveGames } = require('./utils/LiveGames');
const { Player } = require('./utils/Player');

const publicPath = path.join(__dirname, 'public');
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
const liveGames = new LiveGames();

app.use(express.static(publicPath));

app.get('/join/:game/:gameId', (req, res) => {
	console.log(req.params.gameId);
	res.sendFile(publicPath + '/join.html');
});

config.games.forEach((game) => {
	app.get(`/player/${game.name}`, (req, res) => {
		res.sendFile(game.publicPlayer);
	});
	app.get(`/host/${game.name}`, (req, res) => {
		res.sendFile(game.publicHost);
	});
});

io.on('connection', (socket) => {
	console.log(`Connected ${socket.id}`);

	socket.on('disconnect', () => console.log('disconnect ' + socket.id));

	socket.on('startLobby', function(data) {
		console.log(`start lobby for ${data.game}`);
		let game = liveGames.addGame(data.game);
		liveGames.addPlayerToGame(new Player(socket.id, 'Host', 'HOST'), data.game);
		socket.join(`${game.gameId}-host`);
		socket.emit('hostgameId', { game: game, ip: gatewayIp });
	});

	socket.on('joinPlayer', function(data) {
		socket.join(data.gameId);
		liveGames.addPlayerToGame(new Player(socket.id, data.player, 'GUEST'), data.gameId);
		socket.to(`${data.gameId}-host`).emit('updateLobby', liveGames.getPlayers(data.gameId));
		console.log(`Player ${data.player} (${socket.id})  joined ${data.gameId}`);
	});

	socket.on('requestRole', function(data) {
		let role = liveGames.getPlayers(data.gameId).find((player) => player.playerId === data.playerId).role;
		socket.emit('resolveRole', role);
	});

	socket.on('startGame', function(data) {
		liveGames.startGame(data.gameId);
		socket.emit('startGame', {
			players: liveGames.getPlayers(data.gameId)
		});
		socket.broadcast.to(data.gameId).emit('startGame', {
			players: liveGames.getPlayers(data.gameId)
		});
	});

	socket.on('messagePlayers', function(data) {
		socket.to(`${data.gameId}-players`).emit('messagePlayers', data);
	});

	socket.on('messageHost', function(data) {
		socket.to(`${data.gameId}-host`).emit('messageHost', data);
	});

	socket.on('readDatabase', function(data) {
		socket.to(`${data.gameId}-host`).emit('updatePlayers', data);
	});

	socket.on('disconnect', (data) => {
		let playerLeft = liveGames.removePlayerFromGame(socket.id);
		if (playerLeft) {
			socket.to(`${playerLeft.gameId}-host`).emit('updateLobby', liveGames.getPlayers(playerLeft.gameId));
			console.log(`Player ${playerLeft.name} (${socket.id}) left ${playerLeft.gameId}`);
		}
	});
});

const port = 3000;
server.listen(port, () => {
	console.log('PartyHub-Server started on port ' + port);
});
