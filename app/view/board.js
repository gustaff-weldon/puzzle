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
        this.boardOffset = util.dom.offset(this.boardEl);
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
            
            util.mixin(pieceEl.style, {
                width: piece.width + "px",
                height: piece.height + "px",
                left: piece.posX + "px",
                top: piece.posY + "px",
                backgroundImage: "url(" + photoPath + ")",
                backgroundPosition: " -" + piece.posX + "px"
                                  + " -" + piece.posY + "px"
            });
            
            return pieceEl;
    },
    
    /** DnD **/
    bindEvents: function(pieceEl) {
        var initEvt = util.isTouch ? 'touchstart' : 'mousedown',
            moveEvt = util.isTouch ? 'touchmove' : 'mousemove',
            stopEvt = util.isTouch ? 'touchend' : 'mouseup';
        
        pieceEl.addEventListener(initEvt, this.markPieceHold.bind(this));
        pieceEl.addEventListener(moveEvt, this.updatePiecePosition.bind(this));
        pieceEl.addEventListener(stopEvt, this.markPieceRelease.bind(this));
    },
    
    markPieceHold: function(evt) {
        evt.preventDefault();
        function markHold(node) {
            util.dom.addClass(node, "held");
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
            util.dom.removeClass(node, "held");
            node.parentNode.appendChild(node);
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
            
            if (util.dom.hasClass(node, "held")) {
                node.style.left = (touch.pageX - offset.x) + "px";
                node.style.top = (touch.pageY - offset.y) + "px";
            }
        }
        
        if (evt.changedTouches) {
            markMove(evt.changedTouches[0]);
        } else {
            markMove(evt);
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

