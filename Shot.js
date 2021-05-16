let canvas = document.querySelector("#canvas")
let ctx = canvas.getContext('2d')
let invaderimageone = new Image()
let invaderimagetwo = new Image()
invaderimageone.src = "imges/1enemy.png"
invaderimagetwo.src = "imges/2enemy.png"

class player {
    constructor(x, y,width,height) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
        this.kills = 0
        this.bullets = []
        this.xdir = 1
        this.ydir = 1
    }

    shot() {
        this.bullets.push(new bullet(this.x, this.y))
    }

    moveBullets() {
        if (this.bullets.length !== 0) {
            for (let i = 0; i < this.bullets.length; i++) {
                this.bullets[i].y -= 5;
                if (this.bullets[i].y < 0) this.bullets[i].active = false
            }
        }
    }
    move(){
        // this.width = Math.floor(Math.random() * 200) + 100
        // this.height = Math.floor(Math.random() * 200) + 100
        let incrx = Math.floor(Math.random() * 20) + 1;
        let incry = Math.floor(Math.random() * 20) + 1;
        this.x += incrx * this.xdir
        this.y += incry * this.ydir
        if ((this.x + this.width) > canvas.width) this.xdir = -1
        if (this.x < 0) this.xdir = 1
        if ((this.y+ this.height) > (canvas.height / 2)) this.ydir = -1
        if (this.y < 0) this.ydir = 1

    }
}

class bullet {
    constructor(x, y) {
        this.x = x
        this.y = y
        this.active = true
        this.currentimg = invaderimageone
    }

    drop() {
        this.y += 5
        if (this.y > canvas.height) this.active = false
    }
    remove() {
        this.active = false
    }
    changeimg(){
        if (this.currentimg === invaderimageone){
            this.currentimg = invaderimagetwo
        }else{
            this.currentimg = invaderimageone
        }
    }
}

class wall{
    constructor(x, y,width,height) {
        this.x = x
        this.y = y
        this.width = width
        this.height = height
    }
}


let playerobj = new player(300, canvas.height - 100, 200,30)

let walls = [creatwall(),creatwall()]

let enemybullets = new Array(300)
for (let i = 0; i < 500; i++) {
    enemybullets[i] = new bullet(Math.floor(Math.random() * 900) + 1, Math.floor(Math.random() * -30000));
}
let boss = new player(300,1,100,100)
let timer = 0

function draw() {
    timer++
    //drawing the player
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath()
    ctx.fillStyle = "#000000"
    ctx.fillRect(playerobj.x, playerobj.y, playerobj.width, playerobj.height)
    ctx.fill()
    ctx.stroke()
    playerobj.moveBullets()
    ctx.closePath()


    //drawing walls
    for (let i = 0; i < walls.length; i++) {
        ctx.fillStyle = "Blue"
        ctx.fillRect(walls[i].x, walls[i].y, walls[i].width, walls[i].height)
        ctx.fill()
        ctx.stroke()
    }


    //drawing the bullets
    let bullets = playerobj.bullets
    for (let i = 0; i < bullets.length; i++) {
        if (bullets[i].active) {
            ctx.beginPath()
            ctx.fillStyle = "#7371FC"
            ctx.arc(bullets[i].x + 100, bullets[i].y, 20, 0, 360)
            ctx.fill()
            ctx.stroke()
            ctx.closePath()
        }
    }
    //drawing enemy bullets
    for (let i = 0; i < enemybullets.length; i++) {
        if (enemybullets[i].active) {
            ctx.beginPath()
            ctx.fillStyle = "Red"
            ctx.drawImage(enemybullets[i].currentimg, enemybullets[i].x-20, enemybullets[i].y-20)
            ctx.arc(enemybullets[i].x, enemybullets[i].y, 10, 0, 360)
            ctx.fill()
            ctx.stroke()
            ctx.closePath()
            enemybullets[i].drop()
            if (timer % 30 === 0) {
                enemybullets[i].changeimg()
            }
        }
    }

    //drawing the boss
    if (playerobj.kills >= 2){
        ctx.fillStyle = "red"
        ctx.fillRect(boss.x, boss.y, boss.width, boss.height)
        ctx.fill()
        ctx.stroke()
        boss.move()
        if (timer % 50 === 0) {
            enemybullets.push(new bullet(boss.x,boss.y))
            timer = 0
        }
    }


    check_collisions()


}

window.setInterval(draw, 17)

function check_collisions() {
    for (let i = 0; i < playerobj.bullets.length; i++) {
        if (playerobj.bullets[i].active) {

            //bullet vs bullet
            for (let j = 0; j < enemybullets.length; j++) {
                if (enemybullets[j].active) {
                    let dx = playerobj.bullets[i].x + 100 - enemybullets[j].x;
                    let dy = playerobj.bullets[i].y - enemybullets[j].y;
                    let distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < 30) {
                        playerobj.bullets[i].remove()
                        enemybullets[j].remove()
                        playerobj.kills++
                        if (playerobj.kills === 1){
                            enemybullets = []
                            playerobj.kills++
                        }
                    }
                }
            }

            //player bullet with wall
            for (let j = 0; j < walls.length; j++) {
                if (playerobj.bullets[i].y <( walls[j].y + walls[j].height) && playerobj.bullets[i].x+100 > walls[j].x && playerobj.bullets[i].x+100 < (walls[j].x + walls[j].width)) {
                    playerobj.bullets[i].active = false
                }
            }

            //player bullet with boss
            if (playerobj.kills >=2 && playerobj.bullets[i].y < (boss.y + boss.height) && playerobj.bullets[i].x+100 > boss.x && playerobj.bullets[i].x+100 < (boss.x + boss.width)){
                playerobj.bullets[i].active = false
                // console.log("thats a HIT")
            }

        }
    }
    for (let i = 0; i < enemybullets.length; i++) {
        if (enemybullets[i].active) {
            //enemy bullets with player
            if (enemybullets[i].y > playerobj.y && enemybullets[i].x > playerobj.x && enemybullets[i].x < (playerobj.x + 200)) {
                //console.log("game OVer")
            }

            //enemy bullet with wall
            for (let j = 0; j < walls.length; j++) {

                if (enemybullets[i].y > walls[j].y && enemybullets[i].x > walls[j].x && enemybullets[i].x < (walls[j].x + walls[j].width)) {
                    enemybullets[i].active = false
                }
            }


        }
    }

    //boss with walls
    for (let i = 0; i < walls.length; i++) {
        if (boss.x < walls[i].x+walls[i].width && boss.x+boss.width > walls[i].x   &&    boss.y < walls[i].y+walls[i].height && boss.y+boss.height > walls[i].y){
            boss.xdir *= -1
            boss.ydir *= -1
        }
    }
}


document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight" && (playerobj.x + 200) < canvas.width) {
        playerobj.x += 15
    } else if (e.key === "ArrowLeft" && playerobj.x > 0) {
        playerobj.x -= 15
    } else if (e.key === "ArrowUp") {
        playerobj.shot()
    }
})


function creatwall() {
    return new wall((Math.floor(Math.random() * 900) + 1),Math.floor(Math.random() * 700) + 1,  ((Math.random() * 100) + 50) ,Math.floor(Math.random() * 100) + 50)
}