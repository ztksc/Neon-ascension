// ===== CANVAS SETUP =====
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// ===== AUDIO ENGINE =====
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playTone(freq, duration, type="sine", volume=0.1){
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = volume;
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    osc.start();
    setTimeout(()=>osc.stop(), duration);
}

// background music loop
function musicLoop(){
    playTone(110, 300, "sawtooth", 0.05);
    setTimeout(()=>playTone(220, 300, "triangle", 0.05),300);
    setTimeout(musicLoop,600);
}

// ===== GAME STATE =====
let level = 1;
let gameRunning = false;

let player = {
    x:100,
    y:300,
    w:40,
    h:40,
    speed:5,
    dy:0,
    grounded:false,
    hp:100,
    maxHp:100,
    damage:15,
    cooldown:0
};

let enemies = [];
let boss = null;

// ===== LEVEL SPAWN =====
function spawnLevel(){
    enemies=[];
    boss=null;

    if(level<3){
        for(let i=0;i<level+2;i++){
            enemies.push({
                x:Math.random()*canvas.width,
                y:300,
                hp:50,
                speed:2+level,
                damage:5*level
            });
        }
    }else{
        boss={
            x:canvas.width-200,
            y:300,
            hp:300,
            maxHp:300,
            phase:1,
            speed:3,
            damage:20
        };
    }
}

// ===== UPDATE =====
function update(){

    // gravity
    player.dy+=0.7;
    player.y+=player.dy;

    if(player.y+player.h>canvas.height-60){
        player.y=canvas.height-60-player.h;
        player.dy=0;
        player.grounded=true;
    }

    // cooldown
    if(player.cooldown>0) player.cooldown--;

    // enemy AI
    enemies.forEach(e=>{
        if(e.x < player.x) e.x+=e.speed;
        else e.x-=e.speed;

        if(Math.abs(e.x-player.x)<40){
            player.hp -= e.damage*0.01;
        }
    });

    // boss AI
    if(boss){
        if(boss.x > player.x) boss.x-=boss.speed;
        else boss.x+=boss.speed;

        if(boss.hp < boss.maxHp/2){
            boss.phase=2;
            boss.speed=5;
        }

        if(Math.abs(boss.x-player.x)<60){
            player.hp -= boss.damage*0.02;
        }

        if(boss.hp<=0){
            alert("HAI VINTO!");
            location.reload();
        }
    }

    if(player.hp<=0){
        alert("GAME OVER");
        location.reload();
    }

    if(enemies.length===0 && !boss){
        level++;
        spawnLevel();
    }
}

// ===== ATTACK =====
function attack(){
    if(player.cooldown>0) return;

    playTone(400,100,"square",0.2);

    enemies.forEach(e=>{
        if(Math.abs(e.x-player.x)<80){
            e.hp -= player.damage;
        }
    });

    enemies = enemies.filter(e=>e.hp>0);

    if(boss && Math.abs(boss.x-player.x)<100){
        boss.hp -= player.damage;
    }

    player.cooldown=30;
}

// ===== DRAW =====
function draw(){

    // neon background
    const grad = ctx.createLinearGradient(0,0,0,canvas.height);
    grad.addColorStop(0,"#0f0f1f");
    grad.addColorStop(1,"#000");
    ctx.fillStyle=grad;
    ctx.fillRect(0,0,canvas.width,canvas.height);

    // ground
    ctx.fillStyle="#111";
    ctx.fillRect(0,canvas.height-60,canvas.width,60);

    // player glow
    ctx.shadowBlur=20;
    ctx.shadowColor="cyan";
    ctx.fillStyle="cyan";
    ctx.fillRect(player.x,player.y,player.w,player.h);
    ctx.shadowBlur=0;

    // enemies
    ctx.fillStyle="red";
    enemies.forEach(e=>{
        ctx.fillRect(e.x,e.y,40,40);
    });

    // boss
    if(boss){
        ctx.fillStyle=boss.phase===1?"purple":"orange";
        ctx.fillRect(boss.x,boss.y,80,80);

        // boss hp bar
        ctx.fillStyle="red";
        ctx.fillRect(50,50,300,20);
        ctx.fillStyle="green";
        ctx.fillRect(50,50,(boss.hp/boss.maxHp)*300,20);
    }

    // player hp bar
    ctx.fillStyle="red";
    ctx.fillRect(50,20,200,15);
    ctx.fillStyle="lime";
    ctx.fillRect(50,20,(player.hp/player.maxHp)*200,15);
}

// ===== LOOP =====
function gameLoop(){
    if(!gameRunning) return;
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// ===== CONTROLS =====
document.getElementById("left").ontouchstart=()=>player.x-=player.speed*5;
document.getElementById("right").ontouchstart=()=>player.x+=player.speed*5;
document.getElementById("jump").ontouchstart=()=>{
    if(player.grounded){
        player.dy=-15;
        player.grounded=false;
        playTone(300,100,"triangle",0.1);
    }
};
document.getElementById("attack").ontouchstart=attack;

// ===== START GAME =====
function startGame(){
    document.getElementById("menu").style.display="none";
    document.getElementById("controls").style.display="block";
    canvas.style.display="block";
    gameRunning=true;
    musicLoop();
    spawnLevel();
    gameLoop();
}

