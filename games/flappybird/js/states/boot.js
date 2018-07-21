var bootState = {
	preload: function() {
		game.load.image('loading', 'assets/images/loading.png');
	},
	create: function() {
		game.physics.startSystem(Phaser.Physics.ARCADE);

		this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
		this.scale.pageAlignHorizontally = true;
		this.scale.updateLayout();

		game.state.start('load');
	}
};