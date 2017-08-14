var $this;
// Global Game Objects
var background,
	player,
	cursors,
	glasses,
	scoreText,
	stanimaText;

// Global Values
var playerPosition = 4,
	playerScore = 0,
	playerStanima = 100,
	glassPace = 2000,
	glassSpeed = -200,
	totalGlasses = 0;

// Global functions
function movePlayer (event) {
	if ( event.keyCode == Phaser.Keyboard.UP ) {
		if ( playerPosition === 1 ) return;
		playerPosition--;
	} else if ( event.keyCode == Phaser.Keyboard.DOWN ) {
		if ( playerPosition === 4 ) return;
		playerPosition++;
	} else {
		return;
	}

	var pos_y = game.world.height * ( 0.1 + ( 0.2 * playerPosition ) );
	player.y = pos_y;
};

function launchGlass() {
	// If player has 0 stanima trigger game over and break loop
	// Todo: Improve this to include game over state?
	if ( playerStanima === 0 ) {
		console.log( 'GAME OVER' );
		gameOver = game.add.text( game.world.centerX, game.world.centerY, 'GAME OVER', { fontSize: '32px', fill: '#D8000D' });
		gameOver.anchor.setTo(0.5);
		return;
	}

	var position = Math.round( Math.random() * ( totalGlasses - 1 ) );
	// find glass at random position
	var glass = glasses.getChildAt( position );
	if ( glass ) {
		// If random glass is already in play call again and return
		if ( glass.inMotion ) {
			launchGlass();
			return;
		}
		glass.inMotion = true;
		glass.body.velocity.x = glassSpeed;
	}

	// Loop glasses at glassPace
	setTimeout( launchGlass, glassPace );
};

function glassCatch ( player, glass ) {
	// Prevent double collision
	if ( glass.colliding ) return;

	glass.colliding = true;
	// update score
    playerScore += 100;
    console.log('plus 100');
    scoreText.text = 'Score: ' + playerScore;
    
    // reset glass
    resetGlass( glass );
    
    // -- check level ups --
    // Speed up every 10 catches
    if ( playerScore % 1000 === 0 )
    	speedUp();
    // increase interval every 30 catches
    if ( playerScore % 1000 === 0 )
    	paceUp();

    if ( totalGlasses < 17 && playerScore % 4000 === 0 )
    	addGlasses();
};

function glassMiss ( glass ) {
	// update stanima
	playerStanima -= 20;
	stanimaText.text = 'Score: ' + playerStanima;

	// reset glass
	resetGlass( glass );

};

function resetGlass ( glass ) {
    glass.x = game.world.width + 10;
    glass.body.velocity.x = 0;
    glass.inMotion = false;
    glass.colliding = false;
};

function speedUp () {
	if ( glassSpeed > -500 )
		glassSpeed -= 50;
};
function paceUp () {
	if ( glassPace > 200 )
		glassPace -= 200;
};

function addGlasses () {
	for ( var i = 1; i <= 4; i++ ) {
		var y = ( game.world.height * ( 0.1 + ( 0.2 * i ) ) ) - 50;
		var glass = glasses.create( game.world.width, y, 'glass' );
		glass.scale.setTo(0.5);
		glass.anchor.setTo( 0, 1 );
		glass.body.velocity.x = 0;
		glass.inMotion = false;
	}
	totalGlasses += 4;
};

// Main Game States
var GameState = {
	init: function() {
		this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		this.scale.pageAlignHorizontally = true;
		this.scale.pageAlignVertically = true;

		game.physics.startSystem( Phaser.Physics.ARCADE );
		// game.physics.arcade.gravity.y = 1000;
	},
	preload: function() {
		this.load.image( 'background', 'assets/images/background.jpg' );
		this.load.image( 'glass', 'assets/images/water_glass.png' );

		this.load.spritesheet( 'player', 'assets/images/square_sprite.png', 150, 200, 5 );
	},
	create: function() {
		$this = this;
		// Add Background image
		background = game.add.sprite( 0, 0, 'background' );
		background.width = game.width;
		background.height = game.height;

		// Create Glasses group with 1 glass per "rail"
		glasses = game.add.physicsGroup();
		addGlasses();

		// To use physics like gravity, it needs to be enabled on each sprite
		// this.game.physics.arcade.enable( this.bottle );

		// make objects immovable > this.__.body.immovable = true
		// disable gravity > this.__body.allowGravity = false;

		// Add Player sprite and place at bottom position
		var pos_y = game.world.height * ( 0.1 + ( 0.2 * playerPosition ) );
		player = game.add.sprite( 125, pos_y, 'player' );
		player.anchor.setTo( 1, 1 );
		player.scale.setTo( 0.5 );

		game.physics.arcade.enable( player );
		player.body.allowGravity = false;

		player.animations.add( 'idle', [0,1,2,3,4,5], 12, true );
		player.animations.play( 'idle' );

		// Add Score and Stamina text items
		scoreText = game.add.text( game.world.centerX, 8, 'Score: ' + playerScore, { fontSize: '16px', fill: '#FFF' });
		scoreText.anchor.setTo(0.5, 0);
		stanimaText = game.add.text( game.world.centerX, game.world.height - 8, 'Stanima: ' + playerStanima, { fontSize: '16px', fill: '#FFF' });
		stanimaText.anchor.setTo(0.5, 1);

		game.input.keyboard.onDownCallback = movePlayer;
		setTimeout( launchGlass, glassPace ); 
	},
	update: function() {
		glasses.forEach( function( glass ) {
			if ( glass.inMotion ) {
				if ( game.physics.arcade.overlap( player, glasses, glassCatch, null, this ) )
					return;
				else if ( glass.x < 125 ) {
					glassMiss( glass );
				}
			}
		}, this, true);
	},
	render: function() {
		// glasses.forEach( function( glass ) {
		// 	var index = glasses.getChildIndex( glass );
		// 	game.debug.text( glass.x, 32, 32 * ( index + 1 ), '#D8000D' );
		// }, this, true);
	}
};

var game = new Phaser.Game( 375, 667, Phaser.AUTO, 'water-champ' );

game.state.add('GameState', GameState);
game.state.start('GameState');