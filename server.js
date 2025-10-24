const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname)); // serve index.html and client.js

let players = {};
let food = {x: Math.floor(Math.random()*30), y: Math.floor(Math.random()*30)};

// Generate new food
function spawnFood() {
    food = {x: Math.floor(Math.random()*30), y: Math.floor(Math.random()*30)};
}

// Game loop for AI & collisions
setInterval(() => {
    for (let id in players) {
        const p = players[id];
        let head = {x: p.snake[0].x + p.dx, y: p.snake[0].y + p.dy};
        // Wrap around
        if(head.x<0) head.x=29; if(head.x>29) head.x=0;
        if(head.y<0) head.y=29; if(head.y>29) head.y=0;
        p.snake.unshift(head);

        // Eat food
        if(head.x === food.x && head.y === food.y){
            p.length++;
            spawnFood();
        }

        // Trim snake
        while(p.snake.length > p.length) p.snake.pop();

        // Self collision
        for(let i=1;i<p.snake.length;i++){
            if(head.x===p.snake[i].x && head.y===p.snake[i].y){
                p.snake = [{x: Math.floor(Math.random()*30), y: Math.floor(Math.random()*30)}];
                p.length = 5;
            }
        }
    }

    io.emit('gameState', {players, food});
}, 100);

io.on('connection', socket => {
    socket.on('newPlayer', data => {
        players[socket.id] = {
            name: data.name,
            color: data.color,
            snake: [{x: Math.floor(Math.random()*30), y: Math.floor(Math.random()*30)}],
            dx: 1, dy: 0,
            length: 5
        };
    });

    socket.on('move', movement => {
        if(players[socket.id]){
            players[socket.id].dx = movement.dx;
            players[socket.id].dy = movement.dy;
        }
    });

    socket.on('disconnect', () => {
        delete players[socket.id];
    });
});

http.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
