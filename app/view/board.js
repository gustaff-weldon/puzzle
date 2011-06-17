namespace("PZ.view");

PZ.view.Board = function(controller) {
    this.controller = controller; //remove coupling, just register listener on events?
    this.boardEl = null;
    this.boardOffset = null;
    this.pieceOffset = null; //object {x,y}. Board offset minus half piece width/height

    this.init();
};

PZ.view.Board.prototype = {
    init: function()    {
        var boardDiv = document.createElement('div');
        boardDiv.className = "puzzle-board";
        document.body.appendChild(boardDiv);
        
        this.boardEl = boardDiv;
        this.boardOffset = util.offset(this.boardEl);
    },
    
    setPhoto: function(model) {
        var docFragment = document.createDocumentFragment(),
            i, pieceEl,
            len = model.pieces.length;
        this.pieceOffset = {
            x :this.boardOffset.x + model.pieceWidth/2,
            y :this.boardOffset.y + model.pieceHeight/2,
        }; 
        
        for (i = 0; i < len; i++) {
            pieceEl = this.buildPiece(model.photoPath, model.pieces[i]);
            this.bindEvents(pieceEl);
            docFragment.appendChild(pieceEl);
        }
        this.boardEl.appendChild(docFragment);
    },
    
    buildPiece: function(photoPath, piece) {
            var pieceEl = document.createElement("div");
            pieceEl.id = piece.id;
            pieceEl.className = "puzzle-piece";
            pieceEl.style.width = piece.width + "px";
            pieceEl.style.height = piece.height + "px";
            pieceEl.style.left = piece.posX + "px";
            pieceEl.style.top = piece.posY + "px";
            
            pieceEl.style.backgroundImage = "url(" + photoPath + ")";
            pieceEl.style.backgroundPosition =  
                " -" + piece.posX + "px"
                + " -" + piece.posY + "px";
            
            return pieceEl;
    },
    
    /** DnD **/
    bindEvents: function(pieceEl) {
        if (util.isTouch()) {
            pieceEl.addEventListener('touchstart', util.bind(this.markPieceHold, this));
            pieceEl.addEventListener('touchend', util.bind(this.markPieceRelease, this));
            pieceEl.addEventListener('touchmove', util.bind(this.updatePiecePosition, this));
        } else {
            pieceEl.addEventListener('mousedown', util.bind(this.markPieceHold, this));
            pieceEl.addEventListener('mouseup', util.bind(this.markPieceRelease, this));
        }
    },
    
    markPieceHold: function(evt) {
        evt.preventDefault();
        function markHold(node) {
            node.style.zIndex = "9999";
            node.style.outline = "2px solid white";
            node.style.opacity = "0.7";
            node.style.webkitBoxShadow = "10px 10px 10px black";
        }
        
        var node = null;
        if (evt.changedTouches) {
            node = evt.changedTouches[0].target; 
        } else {
            node = evt.target;
        }
        markHold(node);
        
//        var i, len; 
//            len = evt.changedTouches.length;
//            for (i = 0; i < len; i++) {
//                markHold(evt.changedTouches[i].target);
//            }
//        }
//        else {
//            markHold(evt.target);
//        }
        
    },
    
    markPieceRelease: function(evt){
        evt.preventDefault();
        
        function markRelease(node){
            node.style.outline = "1px solid white";
            node.style.opacity = "1";
            node.style.zIndex = "1";
            node.style.webkitBoxShadow = "none";
            
            return {
                id : node.id,
                x : node.style.left,
                y : node.style.top
            };
        }

        var node = null, updatedNodes = []
        if (evt.changedTouches) {
            node = evt.changedTouches[0].target; 
        } else {
            node = evt.target;
        }
        updatedNodes.push(markRelease(node));

//        
//        var i, len, node, updatedNodes = [];
//        if (evt.changedTouches) {
//            len = evt.changedTouches.length;
//            for (i = 0; i < len; i++) {
//                node = evt.changedTouches[i].target;
//                updatedNodes.push(markRelease(node));
//            }
//        }
//        else {
//            updatedNodes.push(markRelease(evt.target));
//        }
        this.fireEvent('piecemove', {nodes : updatedNodes});
    },
    
    updatePiecePosition: function(evt) {
        evt.preventDefault();
        var self = this;
        function markMove(touch) {
            var node = touch.target,
                offset = self.pieceOffset;
            
            node.style.left = (touch.pageX - offset.x) + "px";
            node.style.top = (touch.pageY - offset.y) + "px";
        }
        
        if (evt.changedTouches) {
            markMove(evt.changedTouches[0])
        }
        
//        if (evt.changedTouches) {
//            var len = evt.changedTouches.length,
//                i;
//            for (i = 0; i < len; i++) {
//                markMove(evt.changedTouches[i]);
//            }
//        }
    }
};
util.mixin(PZ.view.Board.prototype, PZ.event.observable);
PZ.view.Board.prototype.constructor = PZ.view.Board;
