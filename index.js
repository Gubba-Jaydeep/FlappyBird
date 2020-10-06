let BIRD_IMGS
let PIPE_IMG_TOP
let PIPE_IMG_BOTTOM
let BG_IMG
let BASE_IMG
const WIN_WIDTH = 500
const WIN_HEIGHT = 800
const GEN = 0
var bird, pipes, score, base
var scaleX
var scaleY
var mode = 0
const welcomeScreen = 0;
const gameScreen = 1;
const gameOverScreen = 2;
const winScreen = 3;
var dimensions
function preload() {
    BG_IMG = loadImage("imgs/bg.png")
    BASE_IMG = loadImage("imgs/base.png")
    BIRD_IMGS = [loadImage('imgs/bird1.png'), loadImage('imgs/bird2.png'), loadImage('imgs/bird3.png')]
    PIPE_IMG_TOP = loadImage("imgs/pipe_top.png")
    PIPE_IMG_BOTTOM = loadImage("imgs/pipe_bottom.png")
}
function setup() {
    if (windowWidth < 500) {
        dimensions=[windowWidth, windowHeight]
    } else {
        dimensions=[WIN_WIDTH, WIN_HEIGHT]
    }
    var canvas = createCanvas(dimensions[0], dimensions[1]);
    background(127)
    scaleX = dimensions[0]/BG_IMG.width
    scaleY = dimensions[1]/BG_IMG.height
    pixelScaleX = dimensions[0]/WIN_WIDTH
    pixelScaleY = dimensions[1]/WIN_HEIGHT
    image(BG_IMG, 0, 0, BG_IMG.width*scaleX, BG_IMG.height*scaleY)

    bird = new Bird(230*pixelScaleX,350*pixelScaleY)
    pipes=[new Pipe(600*pixelScaleX)]
    base=new Base(730*pixelScaleY)
    score=0
}
class Bird{
    MAX_ROTATION = 25
    ROT_VEL = 20
    ANIMATION_TIME = 5
    constructor(x,y) {
        this.x=x
        this.y=y
        this.tilt = 0
        this.tick_count = 0
        this.vel = 0
        this.height = this.y
        this.img_count = 0
        this.img = BIRD_IMGS[0]
    }

    jump(){
        this.vel = -10.5
        this.tick_count = 0
        this.height = this.y
    }
    move() {

        this.tick_count += 1
        let d = this.vel * this.tick_count + 1.5 * this.tick_count ** 2

        if (d >= 16) {
            d = 16
        }

        if (d < 0) {
            d -= 2
        }

        this.y = this.y + d*pixelScaleY

        if ((d < 0) || (this.y < (this.height + 50))) {
            if (this.tilt < this.MAX_ROTATION) {
                this.tilt = this.MAX_ROTATION
            }
        }
        else {
            if (this.tilt > -90) {
                this.tilt -= this.ROT_VEL
            }
        }
    }
    draw(){
        this.img_count+=1
        if (this.img_count < this.ANIMATION_TIME){
            this.img = BIRD_IMGS[0]
        } else if (this.img_count < this.ANIMATION_TIME*2){
            this.img = BIRD_IMGS[1]
        } else if (this.img_count < this.ANIMATION_TIME*3){
            this.img = BIRD_IMGS[2]
        } else if (this.img_count < this.ANIMATION_TIME*4){
            this.img = BIRD_IMGS[1]
        } else if (this.img_count === this.ANIMATION_TIME*4 + 1) {
            this.img = BIRD_IMGS[0]
            this.img_count = 0
        }
        // translate(width / 2, height / 2)
        // rotate(PI / 180 * 45);
        image(this.img, this.x, this.y, this.img.width*scaleX, this.img.height*scaleY);
    }
    get_mask(){
        return [this.x, this.y, this.x+this.img.width*scaleX, this.y+this.img.height*scaleY]
    }
}
class Pipe{
    GAP = 200*pixelScaleY
    VEL = 5*pixelScaleX

    constructor(x) {
        this.x=x
        this.height=0
        this.top = 0
        this.bottom = 0
        this.PIPE_TOP = PIPE_IMG_TOP
        this.PIPE_BOTTOM = PIPE_IMG_BOTTOM
        this.passed = false
        this.set_height()
    }
    set_height(){
        this.height = floor(random(50,450))*pixelScaleY
        this.top = this.height - this.PIPE_TOP.height*scaleY
        this.bottom = this.height + this.GAP
    }
    move(){
        this.x -= this.VEL
    }
    draw(){
        image(this.PIPE_TOP, this.x, this.top, this.PIPE_TOP.width*scaleX, this.PIPE_TOP.height*scaleY)
        image(this.PIPE_BOTTOM, this.x, this.bottom, this.PIPE_BOTTOM.width*scaleX, this.PIPE_BOTTOM.height*scaleY)
    }
    collide(bird){
        let bird_mask = bird.get_mask()
        let top_mask = [this.x, this.top, this.x+this.PIPE_TOP.width*scaleX, this.top+this.PIPE_TOP.height*scaleY]
        let bottom_mask = [this.x, this.bottom, this.x+this.PIPE_BOTTOM.width*scaleX, this.bottom+this.PIPE_BOTTOM.height*scaleY]

        let b_point = this.overlap(bird_mask, bottom_mask)
        let t_point = this.overlap(bird_mask, top_mask)

        return b_point || t_point;
    }
    overlap(mask1, mask2){
        rect(mask1[0],mask1[1],mask1[2]-mask1[0],mask1[3]-mask1[2])
        if (mask1[0] >= mask2[2] || mask2[0] >= mask1[2]){
            return false
        }
        if (mask1[1] >= mask2[3] || mask2[1] >= mask1[3]){
            return false
        }
        console.log("colided")
        return true
    }
}
class Base{
    VEL = 5*pixelScaleX
    WIDTH = BASE_IMG.width*scaleX
    IMG = BASE_IMG

    constructor(y) {
        this.y = y
        this.x1=0
        this.x2=this.WIDTH
    }

    move(){
        this.x1 -=this.VEL
        this.x2 -= this.VEL
        if((this.x1+this.WIDTH)<0){
            this.x1=this.x2+this.WIDTH
        }
        if((this.x2+this.WIDTH)<0){
            this.x2=this.x1+this.WIDTH
        }
    }
    draw(){
        image(this.IMG, this.x1, this.y, this.IMG.width*scaleX, this.IMG.height*scaleY)
        image(this.IMG, this.x2, this.y, this.IMG.width*scaleX, this.IMG.height*scaleY)
    }

}
function mouseClicked() {
    if (mode === welcomeScreen){
        mode=gameScreen
    }
    else if (mode === gameScreen){ bird.jump() }
    else if (mode === gameOverScreen){
        if(mouseX>=45*pixelScaleX && mouseX<=((45+165)*pixelScaleX) && mouseY>=630*pixelScaleY && mouseY<=((630+60)*pixelScaleY)){
            setup()
            mode=welcomeScreen
        }
        if(mouseX>=300*pixelScaleX && mouseX<=((300+180)*pixelScaleX) && mouseY>=630*pixelScaleY && mouseY<=((630+60)*pixelScaleY)){
            screenshot()
        }
    }
    else if (mode === winScreen){ }

}
function playGame() {
    frameRate(20)
    add_pipe=false
    rem=[]
    var i
    for(i=0;i<pipes.length;i++){
       if(pipes[i].collide(bird)){
           mode=gameOverScreen
       }
       if(pipes[i].x+pipes[i].PIPE_TOP.width < 0){
           rem.push(pipes[i])
       }
       if((!pipes[i].passed) && (pipes[i].x<bird.x)){
           pipes[i].passed=true
           add_pipe=true
       }
       pipes[i].move()
    }
    if(add_pipe===true){
        score+=1
        pipes.push(new Pipe(600*pixelScaleX))
    }
    var j
    for(j=0;j<rem.length;j++){
        for(i=0;i<pipes.length;i++){
            if(rem[j]===pipes[i]){
                pipes.splice(i,1)
                i--;
            }
        }
    }
    if((bird.y+bird.img.height*scaleY >= 730) || bird.y<0){
        mode=gameOverScreen
    }
    bird.move()
    base.move()

    image(BG_IMG, 0, 0, BG_IMG.width*scaleX, BG_IMG.height*scaleY)
    for(i=0;i<pipes.length;i++){
        pipes[i].draw()
    }
    base.draw()
    bird.draw()
    fill(230,240,215)
    textSize(60*pixelScaleX)
    textAlign(CENTER)
    text("Score: "+score,250*pixelScaleX, 450*pixelScaleY)

}
function welcome() {
    image(BG_IMG, 0, 0, BG_IMG.width*scaleX, BG_IMG.height*scaleY)
    base.draw()
    textAlign(CENTER)
    noStroke()
    fill(230,240,215)
    textSize(40*pixelScaleX)
    text("Flappy Bird",250*pixelScaleX, 300*pixelScaleY);
    bird.draw()
    fill(230,240,215)
    textSize(60*pixelScaleX)
    textAlign(CENTER);
    text("Click to Play",250*pixelScaleX, 450*pixelScaleY);

}
function gameOver(){
    image(BG_IMG, 0, 0, BG_IMG.width*scaleX, BG_IMG.height*scaleY)
    for(i=0;i<pipes.length;i++){
        pipes[i].draw()
    }
    base.draw()
    bird.draw()
    textSize(70*pixelScaleX);
    textAlign(CENTER);
    fill(230,240,215)
    text("Game Over",250*pixelScaleX, 450*pixelScaleY);
    text("Score: "+score,250*pixelScaleX, 300*pixelScaleY);
    textSize(30*pixelScaleX);

    strokeWeight(0);
    stroke(0)
    fill(255,255,255,100)
    rect(45*pixelScaleX, 630*pixelScaleY, 165*pixelScaleX, 60*pixelScaleY,20);
    textAlign(CENTER,CENTER);
    noStroke()
    fill(80)
    textSize(30*pixelScaleX);
    text("Play Again",(45+(165/2))*pixelScaleX, (630+(60/2))*pixelScaleY);


    strokeWeight(0);
    stroke(0)
    fill(255,255,255,100)
    rect(300*pixelScaleX, 630*pixelScaleY, 180*pixelScaleX, 60*pixelScaleY,20)
    textAlign(CENTER,CENTER);
    noStroke()
    fill(80)
    textSize(30*pixelScaleX);
    text("Screenshot",(300+(180/2))*pixelScaleX, (630+(60/2))*pixelScaleY);

}
function draw(){
    if (mode === welcomeScreen){ welcome() }
    else if (mode === gameScreen){ playGame() }
    else if (mode === gameOverScreen){ gameOver()}
    else if (mode === winScreen){ }
}
function screenshot(){
    save('FlappyBird.jpg')
}
