namespace('PZ');

PZ.Game  = function() {
    this.view = null;
    this.model = null;
}

PZ.Game.prototype = {
    start: function() {
        this.model = this.buildModel();
        this.view = new PZ.view.Board(this);
        this.view.addEventListeners({
            'piecemove': this.onUpdatePieces.bind(this),
            'shuffle':   this.onShuffle.bind(this)
        });
        
        this.fireEvent('gameStarted', this.model);
        this.fireEvent('newGame', {
            model: this.model
        });
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
                    id: 'p_' + x + '_' + y,
                    px: x,
                    py: y,
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
    
    shufflePieces: function(minX, maxX, minY, maxY) {
        var pieces = this.model.pieces,
            len = pieces.length, i;
        for(i = 0; i < len; i++) {
            pieces[i].posX = util.randomInt(minX, maxX);
            pieces[i].posY = util.randomInt(minY, maxY);
        }
    },
    
    /** Event handlers **/
    onShuffle : function(data) {
        util.log('got shuffle');
        var maxX = document.body.offsetWidth - this.model.pieceWidth,
            maxY = document.body.offsetHeight - this.model.pieceHeight;
        this.shufflePieces(20, maxX - 20, 20, maxY - 20);
        this.fireEvent('shuffled', {
            model: this.model
        });
    },
    
    onUpdatePieces : function(data) {
        var ids = data.nodes; 
        util.log(ids.length + ' piece(s) updated: ', ids);
    }
};

util.mixin(PZ.Game.prototype, PZ.event.observable);
PZ.Game.prototype.constructor = PZ.Game;


(function() {
    var game = new PZ.Game();
    game.addEventListener('gameStarted', function(data) {
        util.log('Game started', data);
    });
    game.start();
}())

