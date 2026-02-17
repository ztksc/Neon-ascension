const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let level = 1;
let gems = parseInt(localStorage.getItem("gems")) || 0;
let gameRunning = false;

const characters = {
    Kael:{hp:100,speed:5,damage:10},
    Nyra:{hp:80,speed:7,damage:8},
    Drax:{hp:150,speed:3,damage:15}
};

const skins = {
    Default:{cost:0,color:"cyan"},
    Shadow:{cost:0,color:"white"},
    Neon:{cost:0,color:"magenta"},
    Gold:{cost:100,color:"gold"},
    Flame:{cost:200,color:"orange"},
    CyberCore:{cost:300,color:"lime"}
};

let player = {
    x:100,
    y:300,
    width:40,
    height:40,
    dy:0,
    grounded:false,
    hp:100,
    damage:10,
    speed:5,
    color:"cyan"
};

let enemies = [];
let boss = null;

function populateMenu(){
    const cSel=document.getElementById("characterSelect");
    const sSel=document.getElementById("skinSelect");
    for(let c in characters){
        let o=document.createElement("option");
        o.value=c; o.text=c;
        cSel.appendChild(o);
    }
    for(let s in skins){
        let o=document.createElement("option");
        o.value=s;
        o.text=s+" ("+skins[s].cost+"💎)";
        sSel.appendChild(o);
    }
    document.getElementById("gemsDisplay").innerText="Gemme: "+gems;
}

function startGame(){
    const c=document.getElementById("characterSelect").value;
    const s=document.getElementById("skinSelect").value;

    if(skins[s].cost>gems){ alert("Gemme insufficienti"); return; }
    gems-=skins[s].cost;
    localStorage.setItem("gems",gems);

    Object.assign(player,characters[c]);
    player.color=skins[s].color;

    document.getElementById("menu").style.display="none";
    document.getElementById("controls").style.display="block";
    canvas.style.display="block";

    spawnLevel();
    gameRunning=true;
    gameLoop();
}

function spawnLevel(){
    enemies=[];
    boss=null;

    if(level<3){
        for(let i=0;i<level+2;i++){
            enemies.push({
                x:Math.random()*canvas.width,
                y:300,
                hp:30*level
            });
        }
    } else {
        boss={x:canvas.width-150,y:300,hp:200,phase:1};
    }
}

function update(){
    player.dy+=0.6;
    player.y+=player.dy;

    if(player.y+player.height>canvas.height-50){
        player.y=canvas.height-50-player.height;
        player.dy=0;
        player.grounded=true;
    }

    enemies.forEach(e=>{
        if(Math.abs(player.x-e.x)<40){
            e.hp-=player.damage;
            if(e.hp<=0){
                gems+=20;
                enemies.splice(enemies.indexOf(e),1);
            }
        }
    });

    if(boss){
        if(Math.abs(player.x-boss.x)<60){
            boss.hp-=player.damage;
        }
        if(boss.hp<100) boss.phase=2;
        if(boss.hp<=0){
            alert("Boss sconfitto! Gioco completato!");
            location.reload();
        }
    }

    if(enemies.length===0 && !boss){
        level++;
        spawnLevel();
    }
}

function draw(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    ctx.fillStyle=player.color;
    ctx.fillRect(player.x,player.y,player.width,player.height);

    ctx.fillStyle="red";
    enemies.forEach(e=>{
        ctx.fillRect(e.x,e.y,40,40);
    });

    if(boss){
        ctx.fillStyle=boss.phase===1?"purple":"orange";
        ctx.fillRect(boss.x,boss.y,80,80);
    }
}

function gameLoop(){
    if(!gameRunning) return;
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

document.getElementById("left").ontouchstart=()=>player.x-=player.speed*5;
document.getElementById("right").ontouchstart=()=>player.x+=player.speed*5;
document.getElementById("jump").ontouchstart=()=>{
    if(player.grounded){ player.dy=-15; player.grounded=false; }
};
document.getElementById("attack").ontouchstart=()=>{};

populateMenu();
