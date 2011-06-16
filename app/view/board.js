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
        //this image shou
        var img = document.createElement("img");
        img.setAttribute('src', photoPath);
        
        this.boardEl.innerHTML = "";
        this.boardEl.appendChild(img);
        
        if (pieces) {
            this.buildPuzzle(photoPath, pieces);
        }
    },
    
    buildPuzzle: function(photoPath, pieces) {
        //TODO use DocumentFragment
        var l = pieces.length, piece, pieceEl;
        for (var i = 0; i < l; i++) {
            piece = pieces[i];
            pieceEl = document.createElement("div");
            pieceEl.className = "puzzle-piece "
                + "p" + piece.x + piece.y;
            pieceEl.style.width = piece.width + "px";
            pieceEl.style.height = piece.height + "px";
            pieceEl.style.left = piece.posX + "px";
            pieceEl.style.top = piece.posY + "px";
            
            pieceEl.style.backgroundImage = "url(" + photoPath + ")";
             pieceEl.style.backgroundPosition =  
                " -" + piece.posX + "px"
                + " -" + piece.posY + "px";
            
            this.boardEl.appendChild(pieceEl);
        }
    }
};
PZ.view.Board.prototype.constructor = PZ.view.Board;
