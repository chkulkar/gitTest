'use strict';

// define game and game variables
var game = new Phaser.Game(700, 400, Phaser.AUTO, 'phaser');
var scoreText;
var platforms;
var player;
var playerVelocity;
var extremeMODE;
var level;
var highScore;
var stars;
var cursors;
var noStars = 12;
// define MainMenu state and methods
var MainMenu = function(game) {};
MainMenu.prototype = {
		//load game assets
		preload: function() {
		game.load.path = 'assets/img/'; 
		game.load.image('galaxy', 'galaxy.png'); //galaxy asset by LuminousDragonGames from opengameart.org
		game.load.image('star','star.png'); //star asset from CMPM120 class example
		game.load.image('ground', 'platform.png');
		game.load.image('planet', 'planet14.png'); //planet asset by nicisbig from opengameart.org
		game.load.atlasJSONHash('atlas', 'spritesheet.png', 'sprites.json'); //player sprite from CMPM120 class example
		//game.load.image('doggo', 'doggo.png');
		game.load.atlasJSONHash('atlas2', 'AI.png', 'AI.json'); 
		game.load.image('asteroid', 'asteroid.png'); //asteroid asset by phaelax from opengameart.org

		game.load.image('snow', 'snow.png');
		game.load.image('sky', 'sky.png');
		// game.load.image('diamond', 'assets/img/diamond.png');
		game.load.spritesheet('dude', 'dude.png', 32, 48);
		game.load.spritesheet('baddie', 'baddie.png', 32, 32);
		


		// load audio assets
		game.load.path = 'assets/audio/';
		game.load.audio('pop', 'pop01.mp3');
		game.load.audio('music', ['music.ogg']); //music by CleytonKauffman from opengameart.org
		game.load.audio('levelup', ['levelup.wav']); //level up music by SubspaceAudio from opengameart.org
		game.load.audio('death', ['death.mp3']); //death sound from CMPM120 class example
	},
	init: function() {
		this.score = 0; // tracks the player's score
		this.life = 1;	// tracks the player's life
	},
	create: function() {
		// set bg color to blue
		game.stage.backgroundColor = '#4488AA';
		printMessages('Star Catch Game', 'Use Arrowkeys to Move','Press [Space] to begin');

	},
	update: function() {
		// go to play stage when spacebar is pressed
		if(game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
			game.state.start('Play', true, false, this.score, this.life);
		}
	}
}

// define Play state and methods
var Play = function(game) {
	this.snow;
};
Play.prototype = {
	init: function(scr, life) {
		// get score & life from previous state
		this.score = scr;
		this.life = life;

	},
	create: function() {
		//enable Arcade Physics system
		game.physics.startSystem(Phaser.Physics.ARCADE);
		//add game background
		game.add.sprite(0,0,'sky');
		sound = game.add.audio('pop');

		//create platforms group
		platforms = game.add.group();
		platforms.enableBody = true; //enable physics for platforms

		//create ground
		var ground = platforms.create(0, game.world.height-60, 'ground');
		ground.scale.setTo(2, 2); //scale ground
		ground.body.immovable = true; //prevent ground from moving

		//create obstacle
		planet = game.add.sprite(160, game.world.height-150, 'planet');
		game.physics.arcade.enable(planet);
		planet.body.collideWorldBounds = true; 
		//create player
		player = game.add.sprite(32, game.world.height - 150, 'dude');

		//enable physics and set bounce and gravity for player 
		game.physics.arcade.enable(player);
		player.body.bounce.y = 0.2; 
		player.body.gravity.y = 300; 
		player.body.collideWorldBounds = true; //prevent player from going off screen

		//create player left and right movements
		//player.animations.add('left', [0, 1, 2, 3], 10, true);
		player.animations.add('right',[5, 6, 7, 8], 10, true);

		//create enemies at different locations and enable physics
		enemy = game.add.sprite(170, game.world.height - 150, 'baddie');
		game.physics.arcade.enable(enemy);
		// enemy2 = game.add.sprite(470, 465, 'baddie');
		enemy.body.bounce.y = 0.2; 
		enemy.body.gravity.y= 300;
		enemy.body.collideWorldBounds = true; 
		//enemy2.body.bounce.y = 0.2;
		//enemy2.body.gravity.y= 300;
		//enemy2.body.collideWorldBounds = true;
		enemy.animations.add('left',[0, 1], 4, true); //create enemy left movement
		//enemy2.animations.add('right', [2,3], 4, true); //create enemy right movement

		//add star group
		stars = game.add.group();
		stars.enableBody = true;

		//create 12 stars with gravity and bounce
		for (var i = 0; i < 12; i++){
			var star = stars.create(i * 50, 0, 'star');
			star.body.gravity.y = 60;
			star.body.bounce.y = 0.5 + Math.random() * 0.2;
		}

		// //create diamond at random area of game screen
		// diamond = game.add.group();
		// diamond.enableBody = true;
		// var diamonds = diamond.create(Math.random() * 500, Math.random() * 500, 'diamond');
	
		//create 100 snowflakes and set x/y position, rotation, and transparency
		for (var j=0; j < 100; j++){
			this.snow = new Snowstorm(game, 'snow', 3, Math.PI);
			game.add.existing(this.snow);
			this.snow.rotation = 100;
			this.snow.alpha = 0.4;
		}

		//set score's text size, color, and position
		scoreText = game.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000'});

	},
	update: function() {
		//create variables for player and enemy collision with platforms
		var hitPlatform = game.physics.arcade.collide(player, platforms);
		var baddiePlatform = game.physics.arcade.collide(enemy, platforms);
		//var baddie2Platform = game.physics.arcade.collide(enemy2, platforms);

		//set player velocity to 0 
		player.body.velocity.x = 0;

		//play enemy animations
		enemy.animations.play('left');
		player.animations.play('right');
		//enemy2.animations.play('right');

		//enables Phaser Keyboard manager
		cursors = game.input.keyboard.createCursorKeys();

		if (cursors.left.isDown){
			//move player to left
			player.body.velocity.x = -150;
			//player.animations.play('left');
		}
		if (cursors.right.isDown){
			//move player to right
			player.body.velocity.x = 150;
			player.animations.play('right');
		}

		//allow player to jump when on ground
		if (cursors.up.isDown && player.body.touching.down && hitPlatform){
			player.body.velocity.y = -350;
		}
		//check for star collision with platform
		game.physics.arcade.collide(stars, platforms);


		//check for player overlap with star
		game.physics.arcade.overlap(player, stars, collectStar, null, this);

		
		//check for player collision with enemy
		game.physics.arcade.overlap(player, enemy, hitEnemy, null, this);

		//check for player collision with obstacle
		game.physics.arcade.overlap(player, planet, hitObstacle, null, this);


		//go to game over screen when player has no more lives
		if (this.life < 1){
			game.state.start('GameOver', true, false, this.score, this.life);
		}
	}
}

// define GameOver state and methods
var GameOver = function(game) {};
GameOver.prototype = {
	init: function(scr, life) {
		//get score and life
		this.score = scr;
		this.life = life;
	},
	create: function() {
		//set bg to blue and print game over messages
		game.stage.backgroundColor = '#4488AA';
		printMessages('Game Over', 'Final Score: ' + this.score, 'Press [SPACE] to Retry');
	},
	update: function() {
		//go back to menu when spacebar is pressed
		if(game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR)) {
			game.state.start('MainMenu');
		}
	}
}

function printMessages(top_msg, mid_msg, btm_msg) {
	//print messages for main menu and gameover screens
	let message = '';
    let style1 = { font: '28px Helvetica', fill: '#FFF', align: "center" };
    let style2 = { font: '18px Helvetica', fill: '#FFF', align: "center" };
    let style3 = { font: '18px Helvetica', fill: '#FFF', align: "center" };
	message = game.add.text(50, game.world.centerY, top_msg, style1);
	message = game.add.text(50, game.world.centerY+48, mid_msg, style2);
	message = game.add.text(50, game.world.centerY+86, btm_msg, style3);
}

function collectStar (player, star){
	//play sound when star is collected
	sound.play();
 	//delete star from screen
	star.kill();
 	//increase score by 10 when star is collected
	this.score = this.score + 10; 
	scoreText.text = 'score: ' + this.score;
	//when last star is collected, decrease life
	noStars = noStars - 1;
	if (noStars == 0){
		this.life--;
	}	
}

 function hitEnemy (player, enemy){ 
	//delete enemy from screen
	enemy.kill();
 	//decrease score by 25 when player touches enemy
	// this.score = this.score - 25;
	// scoreText.text = 'score: ' + this.score;
	//when player touches enemy, decrease life
	this.life--; 
 }

 function hitObstacle(player, planet) {
 	planet.kill();
 	this.score = this.score - 5;
 	scoreText.text = 'score: ' + this.score;
 	//add distance stuff
 }

//add all game states to game and start game with main menu screen
game.state.add('MainMenu', MainMenu);
game.state.add('Play', Play);
game.state.add('GameOver', GameOver);
game.state.start('MainMenu');
