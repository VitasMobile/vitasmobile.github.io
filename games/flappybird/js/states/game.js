var gameState = {
	GROUND_POSITION: 0, // constant for vertical position of the ground
	INIT_BIRD_POSITION: 200, // constanc for init position of the bird vertically
	BIRD_GRAVITY: 700, // constant for force of gravity for bird
	BIRD_JUMP: 230, // acceleration jump for bird
	LABEL_SCORE_V: 50, // init vertical position for score label
	bird: undefined, // variable for sprite of bird
	bg: undefined, // variable for sprite of background
	ground: undefined,
	timer: undefined,
	isFlying: false,
	isGameOver: false,
	score: 1,
	maxScore: 1,

	tutorial: undefined,
	getReadyText: undefined,
	gameOverText: undefined,
	gameTitle: undefined,
	gameOverWnd: undefined,
	playButton: undefined,
	gameOverScoreText: undefined,
	gameOverMaxScoreText: undefined,
	newRecordLabel: undefined,
	coin: undefined,

	pipes: undefined, // Phaser.group for pipe parts
	holes: undefined, // Phaser.group for hole in pipes

	birdYoyoTween: undefined, // Animation for bird in Main menu

	create: function() {
		// restore saved data of maximum score from local storage
		this.maxScore = localStorage.getItem("maxScore");
		if (this.maxScore == undefined)
			this.maxScore = 0;

		// creating game screen
		// background
		this.bg = game.add.tileSprite(0, 0, game.width, game.height, 'atlas', 'background_day');
		this.GROUND_POSITION = game.height - 50;
		this.ground = game.add.tileSprite(0, this.GROUND_POSITION, game.width, 100, 'atlas', 'ground');

		// bird hero game
		this.bird = game.add.sprite(200, this.INIT_BIRD_POSITION, 'atlas');
		this.bird.animations.add('fly', Phaser.Animation.generateFrameNames('birdFrame', 0, 3), 5, true);
		this.bird.animations.play('fly');
		this.bird.anchor.setTo(-.2, .5);
		this.birdYoyoTween = game.add.tween(this.bird).to( {y: this.INIT_BIRD_POSITION-20}, 1000, Phaser.Easing.Cubic.InOut, true, 0, -1).yoyo(true, 0);
		game.add.tween(this.bird).from( {x: -30}, 2000, Phaser.Easing.Circular.Out, true);

		game.physics.arcade.enable(this.bird);
		game.physics.startSystem(Phaser.Physics.ARCADE);

		// create obstacles in the game
		this.pipes = game.add.group();
		this.holes = game.add.group();
		this.timer = game.time.events.loop(1500, this.addRowOfPipes, this); // generation of pipes every 1.5 seconds

		// creating gui elements
		// for main menu
		this.gameTitle = game.add.sprite(game.width / 2, 50, 'atlas', 'gameTitle');
		this.gameTitle.anchor.setTo(.5, .5);
		game.add.tween(this.gameTitle).from( {y: -100}, 2000, Phaser.Easing.Bounce.Out, true);

		this.getReadyText = game.add.sprite(game.width / 2, 150, 'atlas', 'getReadyText');
		this.getReadyText.anchor.setTo(.5, .5);
		game.add.tween(this.getReadyText).from( {alpha: 0, width: 0, height: 0}, 1000, Phaser.Easing.Cubic.Out, true, 1000);

		this.tutorial = game.add.sprite(game.width / 2, game.height / 2+50, 'atlas', 'tutorial');
		this.tutorial.anchor.setTo(.5, .5);
		game.add.tween(this.tutorial).from( {alpha: 0}, 2000, Phaser.Easing.Cubic.Out, true, 2000);


		// create hud of score
		this.score = 0;
		this.labelScore = game.add.bitmapText(game.width / 2, this.LABEL_SCORE_V, 'digitals', parseInt(this.score), 64);
		this.labelScore.anchor.setTo(.5, .5);


		// create gui elements for game over
		this.gameOverText = game.add.sprite(game.width / 2, 70, 'atlas', 'gameOverText');
		this.gameOverText.anchor.setTo(.5, .5);
		this.gameOverText.visible = false;

		this.gameOverWnd = game.add.group();
		
		var gameOverWindow = game.add.sprite(game.width / 2, game.height / 2-20, 'atlas', 'resultWindow');
		gameOverWindow.anchor.setTo(.5, .5);
		this.gameOverWnd.add(gameOverWindow);

		this.gameOverScoreText = game.add.bitmapText(gameOverWindow.x + 28, gameOverWindow.y - 25, 'digitals', zeroPad(this.score, 5), 37);
		this.gameOverWnd.add(this.gameOverScoreText);
		
		this.gameOverMaxScoreText = game.add.bitmapText(gameOverWindow.x + 28, gameOverWindow.y + 18, 'digitals', zeroPad(this.maxScore, 5), 37);
		this.gameOverWnd.add(this.gameOverMaxScoreText);

		this.newRecordLabel = game.add.sprite(gameOverWindow.x -10, gameOverWindow.y + 20, 'atlas', 'new_record');
		this.gameOverWnd.add(this.newRecordLabel);
		this.newRecordLabel.visible = false;

		this.coin = game.add.sprite(gameOverWindow.x - 86, gameOverWindow.y - 15, 'atlas', 'silver_coin');
		this.gameOverWnd.add(this.coin);
		this.coin.addChild(game.add.sprite(0, 0, 'atlas', 'gold_coin'));

		this.playButton = game.add.sprite(game.width / 2, game.height / 2 + 80, 'atlas', 'playButton');
		this.playButton.anchor.setTo(.5, .5);
		this.playButton.inputEnabled = true;
		this.playButton.events.onInputDown.add(this.restartGame, this);
		this.playButton.events.onInputOver.add(function() {
			this.playButton.y = game.height / 2 + 85;
		}, this);
		this.playButton.events.onInputOut.add(function() {
			this.playButton.y = game.height / 2 + 80;
		}, this);

		this.gameOverText.visible = false;
		this.gameOverWnd.visible = false;
		this.playButton.visible = false;

		game.world.bringToTop(this.bird); // the Bird should be on top of all objects on screen

		// add listeners for key Spacebar presses and click of mouse
		game.input.onDown.add(this.onClicked, this);
		var spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		spaceKey.onDown.add(this.onClicked, this);

		// preparation of sounds
		this.dieSound = game.add.audio('die');
		this.hitSound = game.add.audio('hit');
		this.pointSound = game.add.audio('point');
		this.swooshingSound = game.add.audio('swooshing');
		this.wingSound = game.add.audio('wing');

	},
	update: function() {
		if (!this.isGameOver && this.bird.alive) {
			this.bg.tilePosition.x += -.1;
			this.ground.tilePosition.x += -1;
		}

		if (!this.isFlying && !this.isGameOver) {
			// anything before the game starts
		} else if (!this.isGameOver) {
			if (this.bird.y < 0)
				this.hitPipe();
			if (this.bird.y > this.GROUND_POSITION-30)
				this.gameOver();
			game.physics.arcade.overlap(this.bird, this.pipes, this.hitPipe, null, this);
			game.physics.arcade.overlap(this.bird, this.holes, this.addScore, null, this);

			if (this.bird.angle < 20) {
				this.bird.angle += 1;
				if (!this.bird.alive && this.bird.angle == 5)
					this.dieSound.play();
			}
		}
	},

	startGame: function() {
		this.birdYoyoTween.stop();
		this.bird.body.gravity.y = this.BIRD_GRAVITY;
		this.isFlying = true;
		this.bird.alive = true;

		game.add.tween(this.gameTitle).to( {alpha: 0}, 1000, Phaser.Easing.Cubic.In, true).onComplete.add(function() {
			this.gameTitle.visible = false;
		}, this);
		game.add.tween(this.getReadyText).to( {alpha: 0}, 1000, Phaser.Easing.Cubic.In, true).onComplete.add(function() {
			this.getReadyText.visible = false;
		}, this);
		game.add.tween(this.tutorial).to( {alpha: 0}, 1000, Phaser.Easing.Cubic.In, true).onComplete.add(function() {
			this.tutorial.visible = false;
		}, this);

		this.score = 0;
		this.labelScore.text = this.score;
		game.add.tween(this.labelScore).from( {y: -30}, 2000, Phaser.Easing.Bounce.Out, true);
	},
	restartGame: function() {
		this.bird.y = this.INIT_BIRD_POSITION;
		this.bird.angle = 0;
		this.bird.animations.play('fly');
		this.isGameOver = false;
		this.isFlying = false;

		while (this.pipes.children.length > 0) {
			this.pipes.children[0].body = null;
			this.pipes.children[0].destroy();
		}
		while (this.holes.children.length > 0) {
			this.holes.children[0].body = null;
			this.holes.children[0].destroy();
		}

		this.labelScore.y = -30;
		this.labelScore.visible = true;
		game.add.tween(this.labelScore).to( {y: this.LABEL_SCORE_V}, 2000, Phaser.Easing.Bounce.Out, true);

		game.add.tween(this.gameOverText).to( {alpha: 0}, 200, Phaser.Easing.Cubic.In, true).onComplete.add(function() {
			this.gameOverText.visible = false;
			this.gameOverText.alpha = 1;
		}, this)
		game.add.tween(this.gameOverWnd).to( {alpha: 0}, 200, Phaser.Easing.Cubic.In, true, 100).onComplete.add(function() {
			this.gameOverWnd.visible = false;
			this.gameOverWnd.alpha = 1;
		}, this)
		game.add.tween(this.playButton).to( {alpha: 0}, 200, Phaser.Easing.Cubic.In, true, 200).onComplete.add(function() {
			this.playButton.visible = false;
			this.playButton.alpha = 1;
			this.startGame();
		}, this)

	},
	gameOver: function() {
		if (this.bird.alive)
			this.hitSound.play();
		this.isGameOver = true;
		this.isFlying = false;
		this.bird.animations.stop();
		this.bird.body.gravity.y = 0;
		this.bird.body.velocity.y = 0;

		this.stopMovementObstacles();

		this.gameOverScoreText.text = zeroPad(this.score, 5);
		if (this.score > this.maxScore) {
			this.maxScore = this.score;
			localStorage.setItem("maxScore", this.maxScore);
			this.newRecordLabel.visible = true;
			this.gameOverMaxScoreText.text = zeroPad(this.maxScore, 5);
		} else {
			this.newRecordLabel.visible = false;
		}

		this.coin.visible = this.score >= 10;
		this.coin.children[0].visible = this.score >= 30;


		game.add.tween(this.labelScore).to( {y: -30}, 1000, Phaser.Easing.Cubic.In, true).onComplete.add(function() {
			this.labelScore.visible = false;
			this.labelScore.y = this.LABEL_SCORE_V;
		}, this);
		
		this.gameOverText.visible = true;
		game.add.tween(this.gameOverText).from( {alpha: 0, width: 0, height: 0}, 1000, Phaser.Easing.Bounce.Out, true);
		
		this.gameOverWnd.visible = true;
		game.add.tween(this.gameOverWnd).from( {alpha: 0, y: this.gameOverWnd.y+100}, 1000, Phaser.Easing.Cubic.Out, true, 200);
		
		this.playButton.visible = true;
		game.add.tween(this.playButton).from( {y: game.height, alpha: 0}, 1000, Phaser.Easing.Cubic.Out, true, 500);
	},


	addOnePipe: function(pipe) {
		this.pipes.add(pipe);
		game.physics.arcade.enable(pipe);
		pipe.body.velocity.x = -200;

		pipe.checkWorldBounds = true;
		pipe.outOfBoundsKill = true;
	},
	addHole: function(hole) {
		this.holes.add(hole);
		game.physics.arcade.enable(hole);
		hole.body.velocity.x = -200;

		hole.checkWorldBounds = true;
	},
	addRowOfPipes: function() {
		if (!this.isFlying || this.isGameOver || !this.bird.alive)
			return;

		var hole = Math.floor(Math.random() * 4) + 1;
		for (var i = 0; i < 7; i++) {
			if (i != hole && i != hole+1) {
				var pipe = game.add.sprite(game.width, i * 50, 'atlas', (i == hole-1 || i == hole+2 ? 'pipe0' : 'pipe1'));
				if (i == hole-1) {
					pipe.scale.y *= -1;
					pipe.anchor.setTo(0, 1);
				}
				this.addOnePipe(pipe);
			} else if (i == hole) {
				var door = game.add.sprite(game.width+50, i * 50, 'atlas', 'pipe1');
				door.scale.y *= 2;
				door.alpha = 0.0;
				this.addHole(door);
			}
		}
	},

	addScore: function(spr1, spr2) {
		spr2.body = null;
		spr2.destroy();
		this.score += 1;
		this.labelScore.text = this.score;
		this.labelScore.y -= 20;
		game.add.tween(this.labelScore).to( {y: this.LABEL_SCORE_V}, 1000, Phaser.Easing.Bounce.Out, true);
		this.pointSound.play();
	},
	hitPipe: function() {
		if (!this.bird.alive)
			return;

		this.bird.alive = false;
		this.bird.animations.stop();

		this.stopMovementObstacles();

		this.hitSound.play();
	},
	stopMovementObstacles: function() {
		this.pipes.forEach(function(p) {
			p.body.velocity.x = 0;
		}, this);
		this.holes.forEach(function(d) {
			d.body.velocity.x = 0;
		}, this);
	},

	onClicked: function() {
		if (!this.isFlying && !this.isGameOver) {
			this.startGame();
		} else if (!this.isGameOver && this.bird.alive) {
			if (!this.bird.alive)
				return;

			this.bird.body.velocity.y = -this.BIRD_JUMP;
			game.add.tween(this.bird).to({angle: -20}, 100).start();
			this.wingSound.play();
		}
	},
};