namespace("PZ.view");

PZ.view.Board = function(controller) {
    this.controller = controller; //remove coupling, just register listener on events?
    this.boardEl = null;

    this.init();
};

PZ.view.Board.prototype = {
    init: function()    {
        var boardDiv =     document.createElement('div');
        boardDiv.className = "puzzle-board";
        document.body.appendChild(boardDiv);
        this.boardEl = boardDiv;
    },
    
    setPhoto: function(photoPath, pieces) {
        var l = pieces.length, 
            docFragment = document.createDocumentFragment();
            
        for (var i = 0; i < l; i++) {
            docFragment.appendChild(this.buildPiece(photoPath, pieces[i]));
        }
        this.boardEl.appendChild(docFragment);
    },
    
    buildPiece: function(photoPath, piece) {
            var pieceEl = document.createElement("div");
            
            pieceEl.className = "puzzle-piece "
                + "p" + piece.x + "_" + piece.y;
            pieceEl.style.width = piece.width + "px";
            pieceEl.style.height = piece.height + "px";
            pieceEl.style.left = piece.posX + "px";
            pieceEl.style.top = piece.posY + "px";
            
            pieceEl.style.backgroundImage = "url(" + photoPath + ")";
            pieceEl.style.backgroundPosition =  
                " -" + piece.posX + "px"
                + " -" + piece.posY + "px";
            
            return pieceEl;
    }
};
PZ.view.Board.prototype.constructor = PZ.view.Board;
