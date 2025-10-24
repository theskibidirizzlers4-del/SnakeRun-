const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');

const socket = io();

let tileCount = 30;
let gridSize = canvas.width / tileCount;

let dx = 1;
let dy = 0;
let score = 0;

let playerColor = '#00ff00';

document.getElementById('startBtn').addEventListener('click', ()=>{
    const name = document.getElementById('nameInput').value || 'Player';
    playerColor = document.getElementById('colorInput').value;
    socket.emit('newPlayer', {name, color: playerColor});
    document.querySelector('div').style.display = 'none';
});

document.addEventListener('keydown', e=>{
    switch(e.key){
        case 'ArrowUp': if(dy===0){dx=0; dy=-1;} break;
        case 'ArrowDown': if(dy===0){dx=0; dy=1;} break;
        case 'ArrowLeft': if(dx===0){dx=-1; dy=0;} break;
        case 'ArrowRight': if(dx===0){dx=1; dy=0;} break;
    }
    socket.emit('move', {dx, dy});
});

socket.on('gameState', state => {
    ctx.fillStyle = '#222';
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // Draw food
    ctx.fillStyle = 'yellow';
    ctx.fillRect(state.food.x*gridSize, state.food.y*gridSize, gridSize, gridSize);

    score = 0;

    // Draw players
    for(let id in state.players){
        const p = state.players[id];
        ctx.fillStyle = p.color;
        p.snake.forEach(s => ctx.fillRect(s.x*gridSize, s.y*gridSize, gridSize, gridSize));
        if(id === socket.id) score = p.length - 5;
    }

    scoreDisplay.innerText = 'Score: ' + score;
});
