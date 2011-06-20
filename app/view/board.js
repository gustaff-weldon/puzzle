namespace("PZ.view");

PZ.view.Board = function(controller) {
    this.controller = controller; //remove coupling, just register listener on events?
    this.boardEl = null;
    this.boardOffset = null;

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
        pieceEl.addEventListener(moveEvt, util.isTouch
            //touch felt bit laggy - decreasing callback frequency to ~25fps
            ? util.throttle(this.updatePiecePosition.bind(this), 40) 
            : this.updatePiecePosition.bind(this));
        pieceEl.addEventListener(stopEvt, this.markPieceRelease.bind(this));
    },
    
    markPieceHold: function(evt) {
        evt.preventDefault();
        function markHold(node) {
            util.dom.addClass(node, "held");
        }
        
        var node = null, originalEvt = evt, ox = oy = 0;
        if (evt.changedTouches) {
            node = evt.changedTouches[0].target;
            originalEvt = evt.changedTouches[0];
        } else {
            node = evt.target;
        }
        
        //calculate offset within a piece when piece is grabbed
        ox = (originalEvt.pageX - this.boardOffset.x) - parseInt(node.style.left) ;
        oy = (originalEvt.pageY - this.boardOffset.y) - parseInt(node.style.top);
        node.dragOffset = {x: ox, y: oy};
        markHold(node);
    },
    
    markPieceRelease: function(evt){
        evt.preventDefault();
        
        function markRelease(node){
            delete node.dragOffset;
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

        this.fireEvent('piecemove', {nodes : updatedNodes});
    },
    
    updatePiecePosition: function(evt) {
        evt.preventDefault();
        var self = this;
        function markMove(touch) {
            var node = touch.target,
                offset = self.boardOffset;
            
            if (util.dom.hasClass(node, "held")) {
                node.style.left = (touch.pageX - offset.x - node.dragOffset.x) + "px";
                node.style.top = (touch.pageY - offset.y - node.dragOffset.y) + "px";
            }
        }
        
        if (evt.changedTouches) {
            markMove(evt.changedTouches[0]);
        } else {
            markMove(evt);
        }
    }
};

util.mixin(PZ.view.Board.prototype, PZ.event.observable);
PZ.view.Board.prototype.constructor = PZ.view.Board;

