import './scss/style.scss';
import './tutorial/assets/bomb.png';
import './tutorial/assets/dude.png';
import './tutorial/assets/platform.png';
import './tutorial/assets/sky.png';
import './tutorial/assets/star.png';
import Phaser from 'phaser';

var config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 300 }
    }
  },
  scene: {
    preload: preload,
    create: create,
    update: update
  }
};

var game = new Phaser.Game(config);
var platforms,
    player,
    cursors,
    stars,
    bombs;
var score = 0, score_text, game_over;

// main game functions
function preload (){
  this.load.image('sky', './images/sky.png');
  this.load.image('star', './images/star.png');
  this.load.image('ground', './images/platform.png');
  this.load.image('bomb', './images/bomb.png');
  this.load.spritesheet('dude',
       './images/dude.png',
       { frameWidth:32, frameHeight:48 });
}

function create (){
  // add bg
  this.add.image(400, 300, 'sky');
  // this.add.image(400, 300, 'star');
  // add platforms
  platforms = this.physics.add.staticGroup();
  platforms.create(400,568,'ground').setScale(2).refreshBody();
  platforms.create(600,400,'ground');
  platforms.create(50,250,'ground');
  platforms.create(750,220,'ground');
  // add player
  player = this.physics.add.sprite(100,450,'dude');
  player.setBounce(0.4);
  player.setCollideWorldBounds(true);
  this.anims.create({
    key:'left',
    frames:this.anims.generateFrameNumbers('dude', {start:0,end:3}),
    frameRate:10,
    repeat:-1
  });
  this.anims.create({
    key:'turn',
    frames: [ { key:'dude', frame:4 } ],
    frameRate: 20
  });
  this.anims.create({
    key:'right',
    frames:this.anims.generateFrameNumbers('dude', {start:5,end:8}),
    frameRate:10,
    repeat:-1
  });
  this.physics.add.collider(player, platforms);
  player.body.setGravityY(200);
  // create controls
  cursors = this.input.keyboard.createCursorKeys();
  // add star collectibles
  stars = this.physics.add.group({
    key: 'star',
    repeat: 11,
    setXY: { x:12, y:0, stepX:70 }
  });
  stars.children.iterate(child=>{
    child.setBounceY(Phaser.Math.FloatBetween(.4,.8));
  });
  this.physics.add.collider(stars, platforms);
  this.physics.add.overlap(player,stars,collect_star,null,this);
  // add score text
  score_text = this.add.text(16,16,'score: 0',{
    fontSize:'16px',
    fill:'#000',
    fontFamily:'Arial'
  });
  // add bombs
  bombs = this.physics.add.group();
  this.physics.add.collider(bombs, platforms);
  this.physics.add.collider(player, bombs, hit_bomb, null, this);
}

function update(){
  player_movement();
}

// other functions
function hit_bomb(player,bomb){
  this.physics.pause();
  player.setTint(0xff0000);
  player.anims.play('turn');
  let death_text = this.add.text(400,300,'You Died!',{
    fontSize:'40px',
    fill:'#ff0000',
    fontFamily:'Arial'
  });
  death_text.x -= death_text.width/2;
  death_text.y -= death_text.height/2;
  game_over = true;
}
function collect_star(player,star){
  star.disableBody(true,true);
  score+=10;
  score_text.setText(`score: ${score}`);
  if(stars.countActive(true) === 0){
    stars.children.iterate(function (child) {
      child.enableBody(true, child.x, 0, true, true);
    });
    var x = (player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);
    var bomb = bombs.create(x, 16, 'bomb');
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
  }
}
function player_movement(){
  if(game_over == true){ return; }
  if (cursors.left.isDown){
    player.setVelocityX(-160);
    player.anims.play('left', true);
  }
  else if (cursors.right.isDown){
    player.setVelocityX(160);
    player.anims.play('right', true);
  }else{
    player.setVelocityX(0);
    player.anims.play('turn');
  }
  if (cursors.up.isDown && player.body.touching.down){
    player.setVelocityY(-450);
  }
}
