namespace('PZ');

PZ.Game  = function() {
    this.view = null;
}

PZ.Game.prototype.start = function() {
    util.log("Game started");
    this.view = new PZ.view.Board(this);
        
    var pieces = this.calculatePieces(960, 640, 6, 4);
    util.log("Pieces", pieces);
    this.view.setPhoto('./app/assets/test.jpg', pieces);
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


new PZ.Game().start();
