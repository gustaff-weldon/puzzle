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
        var pieces = this.calculatePieces(960, 640, 6, 4),
            pieceMap={};
        pieces.map(function(el) {
            pieceMap[el.id] = el;
        });
        return {
            pieceWidth: pieces[0].width,
            pieceHeight: pieces[0].height, 
            pieces: pieces,
            pieceMap : pieceMap,
            photoPath: './app/assets/test.jpg'
        };
    },
    
    calculatePieces: function(photoWidth, photoHeight, countX, countY){
        var pieceWidth = photoWidth / countX,
            pieceHeight = photoHeight / countY,
            pieces = [], piece = null, offsetX, offsetY;

        var generateId = function(x,y) {
            return 'p_' + x + '_' + y;
        };
        
        for (var y = 0; y < countY; y++) {
            for (var x = 0; x < countX; x++) {
                piece = {
                    id: generateId(x, y),
                    px: x,
                    py: y,
                    width: pieceWidth,
                    height: pieceHeight,
                    posX: x * pieceWidth,
                    posY: y * pieceHeight,
                    nearest:[generateId(x-1,y),  //yes, I know edge elements do not have at least
                            generateId(x+1,y),   //one neighbour, but that's  should not be an issue ;)
                            generateId(x,y-1),
                            generateId(x,y+1)]
                };
                pieces.push(piece);
            }
        }
        
        return pieces;
    },
    
    shufflePieces: function(minX, maxX, minY, maxY) {
        var pieces = this.model.pieces,
            len = pieces.length, i;
        for (i = 0; i < len; i++) {
            pieces[i].posX = util.randomInt(minX, maxX);
            pieces[i].posY = util.randomInt(minY, maxY);
        }
    },

    performMatching: function(changedPieces) {
        var matchedPieces = [];
        changedPieces.forEach(function(id, i) {
            var piece = this.model.pieceMap(id);
            for (var i = 0; i < 4; i++)  {
                var neighbour = this.model.pieceMap(piece.nearest[i]),
                    matched = neighbour && pieceMatch(piece, neighbour);
                if (matched) {
                    matchedPieces.push(neighbour.id)
                }
            }
        });

        function pieceMatch(piece, neighbour) {
            var w = piece.width, h = piece.height, delta = 5; //5px delta, extract to settings?
            //distance between centers of pieces should be equal to width,height with delta allowance
            return false;
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

