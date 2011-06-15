namespace("PZ.view");

PZ.view.Board = function(config) {
	this.controller = config.controller; //remove coupling, just register listener on events?
	this.boardEl = null;

	this.init();
	this.setPhoto(config.photoPath);
};

PZ.view.Board.prototype = {
	init: function()	{
		var boardDiv = 	document.createElement('div');
		boardDiv.className = "puzzle-board";
		document.body.appendChild(boardDiv);
		this.boardEl = boardDiv;
	},
	
	setPhoto: function(path) {
		var img = document.createElement("img");
		img.setAttribute('src', path);
		
		this.boardEl.innerHTML = "";
		this.boardEl.appendChild(img);
	}
};
PZ.view.Board.prototype.constructor = PZ.view.Board;
