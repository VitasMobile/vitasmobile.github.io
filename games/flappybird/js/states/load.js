var loadState = {
	preload: function() {
		var loadingLabel = game.add.text(0, 0, 'Loading...', {font: '30px Courier', fill: '#ffffff', boundsAlignH: 'center', boundsAlignV: 'middle'});
		loadingLabel.setTextBounds(0, 0, game.width, game.height);

		var loadingBar = game.add.sprite(game.width / 2, game.height / 2 + 20, 'loading')
		loadingBar.anchor.setTo(.5, .5);
		game.load.setPreloadSprite(loadingBar);

		// download all required content
		game.load.atlas('atlas', 'assets/images/atlas.png', 'assets/images/atlas.json');
		game.load.bitmapFont('digitals', 'assets/images/atlas.png', 'assets/images/digitals.xml');

		game.load.audio('die', 'assets/sounds/sfx_die.ogg');
		game.load.audio('hit', 'assets/sounds/sfx_hit.ogg');
		game.load.audio('point', 'assets/sounds/sfx_point.ogg');
		game.load.audio('swooshing', 'assets/sounds/sfx_swooshing.ogg');
		game.load.audio('wing', 'assets/sounds/sfx_wing.ogg');
	},
	create: function() {
		game.state.start('game');
	}
};