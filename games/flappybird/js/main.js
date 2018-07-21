var game = new Phaser.Game(800, 400, Phaser.AUTO, 'gameDiv');

game.state.add('boot', bootState);
game.state.add('load', loadState);
game.state.add('game', gameState);

game.state.start('boot');