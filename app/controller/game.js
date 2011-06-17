namespace('PZ');

PZ.Game  = function() {
    this.view = null;
    this.model = null;
}

PZ.Game.prototype = {
    start: function() {
        this.model = this.buildModel();
        this.view = new PZ.view.Board(this);
        this.view.setPhoto(this.model);
        this.view.addEventListener('piecemove', util.bind(this.updatePieces, this));
        this.fireEvent('started', this.model);
    },
    
    buildModel: function(){
        var pieces = this.calculatePieces(960, 640, 6, 4);
        return {
            pieceWidth: pieces[0].width,
            pieceHeight: pieces[0].height, 
            pieces: pieces,
            photoPath: './app/assets/test.jpg'
        };
    },
    
    calculatePieces: function(photoWidth, photoHeight, countX, countY){
        var pieceWidth = photoWidth / countX;
        var pieceHeight = photoHeight / countY;
        
        var pieces = [], piece = null, offsetX, offsetY;
        for (var y = 0; y < countY; y++) {
            for (var x = 0; x < countX; x++) {
                piece = {
                    id: "p_" + x + "_" + y,
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
    },
    
    
    updatePieces : function(data) {
        var ids = data.nodes; 
        util.log(ids.length + " piece(s) updated: " + ids);
    }
};

util.mixin(PZ.Game.prototype, PZ.event.observable);
PZ.Game.prototype.constructor = PZ.Game;


(function() {
    var game = new PZ.Game();
    game.addEventListener('started', function(data) {
        util.log("Game started", data);
    });
    game.start();
}())