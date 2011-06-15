namespace('PZ');

PZ.Game  = function() {
	this.view = null;
}

PZ.Game.prototype.start = function() {
	this.view = new PZ.view.Board({
		controller : this,
		photoPath  : './app/assets/test.jpg'
	});
	util.log("Game started");
}

new PZ.Game().start();
