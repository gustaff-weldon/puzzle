namespace('PZ');

PZ.Game  = function() {
    this.view = null;
}

PZ.Game.prototype.start = function() {
    this.view = new PZ.view.Board(this);
        
    var pieces = this.calculatePieces(960, 640, 6, 4);
    this.view.setPhoto('./app/assets/test.jpg', pieces);
    
    this.fireEvent('started', {pieces: pieces});
}

PZ.Game.prototype.calculatePieces = function(photoWidth, photoHeight, countX, countY) {
    var pieceWidth = photoWidth / countX;
    var pieceHeight = photoHeight / countY;
    
    var pieces = [], piece = null, offsetX, offsetY;
    for (var y = 0; y < countY; y++) {
        for (var x = 0; x < countX; x++) {
            piece = {
                x: x,
                y: y,
                width: pieceWidth,
                height: pieceHeight,
                posX: x * pieceWidth,
                posY: y * pieceHeight,
            }
            pieces.push(piece);
        }
    }
    
    return pieces;
}
util.mixin(PZ.Game.prototype, PZ.event.observable);

(function() {
    var game = new PZ.Game();
    game.addEventListener('started', function(data) {
        util.log("Game started", data);
    });
    game.start();
}())