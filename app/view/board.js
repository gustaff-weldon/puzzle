namespace('PZ.view');

PZ.view.Board = function(controller) {
    this.controller = controller; //remove coupling, just register listener on events?
    this.boardEl = null;
    this.boardOffset = null;
    this.mouseDragInProgress = false;
    this.elPieces = {};
    
    controller.addEventListeners({
        'newGame':      this.onNewGame.bind(this),
        'shuffled':     this.onShuffled.bind(this),
        'modelUpdated': this.onModelUpdate.bind(this)
    });
    this.init();
};

PZ.view.Board.prototype = {
    init: function()    {
        var boardDiv = document.createElement('div');
        boardDiv.className = 'puzzle-board full';
        document.body.appendChild(boardDiv);
        
        this.boardEl = boardDiv;
        this.boardOffset = util.dom.offset(this.boardEl);
    },
    
    buildPiece: function(photoPath, piece) {
            var pieceEl = document.createElement('div');
            pieceEl.id = piece.id;
            pieceEl.className = 'puzzle-piece';
            
            util.mixin(pieceEl.style, {
                width: piece.width + 'px',
                height: piece.height + 'px',
                left: piece.posX + 'px',
                top: piece.posY + 'px',
                backgroundImage: 'url(' + photoPath + ')',
                backgroundPosition: ' -' + piece.posX + 'px'
                                  + ' -' + piece.posY + 'px'
            });
            
            return pieceEl;
    },
    
    bindShuffleEvents: function() {
        var shuffleEvt = util.isTouch ? 'touchstart' : 'mousedown';
        var listener = null;
        this.boardEl.addEventListener(shuffleEvt, listener = function(evt) {
            util.dom.removeClass(this.boardEl, "full");
            //unregister shuffle listener
            this.boardEl.removeEventListener(shuffleEvt, listener);
            this.fireEvent('shuffle', {});
        }.bind(this)); 
    },
    
    /** listener methods **/
    onNewGame : function(data) {
        var docFragment = document.createDocumentFragment(),
            i, pieceEl,
            model = data.model,
            len = model.pieces.length;
        
        for (i = 0; i < len; i++) {
            pieceEl = this.buildPiece(model.photoPath, model.pieces[i]);
            this.elPieces[pieceEl.id] = pieceEl;  
            docFragment.appendChild(pieceEl);
        }
        this.boardEl.appendChild(docFragment);
        
        this.bindShuffleEvents();
    },
    
    onShuffled: function(data) {
        //pieces shuffled, now bind events to pieces
        for (var id in this.elPieces) {
            this.bindEvents(this.elPieces[id]);
        }
        this.onModelUpdate(data);
    },

onModelUpdate : function(data) {
    function markElementMatched(pieceEl) {
        util.dom.addClass(pieceEl, "matched");
        setTimeout(function() {
            util.dom.removeClass(pieceEl, "matched");
        }, 600);
    }

    var pieces = data.model.pieces,
            len = pieces.length, i, id,
            offset = this.boardOffset;
        for (i = 0; i < len; i++) {
            id = pieces[i].id;

            if (data.matched && data.matched.indexOf(id) !== -1) {
                markElementMatched(this.elPieces[id]);
            }
            else {}
            util.mixin(this.elPieces[id].style, {
                left: (pieces[i].posX  - offset.x) + 'px',
                top: (pieces[i].posY  - offset.y) + 'px'
            });
        }
    },    
   
    /** DnD **/
    bindEvents: function(pieceEl) {
        var initEvt = util.isTouch ? 'touchstart' : 'mousedown',
            moveEvt = util.isTouch ? 'touchmove' : 'mousemove',
            stopEvt = util.isTouch ? 'touchend' : 'mouseup';
        
        pieceEl.addEventListener(initEvt, this.markPieceHold.bind(this));
        pieceEl.addEventListener(moveEvt, util.isTouch
            //touch felt a bit laggy - decreasing callback frequency to ~25fps
            ? util.throttle(this.updatePiecePosition.bind(this), 40) 
            : this.updatePiecePosition.bind(this));
        
        //prevent loosing mousemove events when element does not follow cursor quick enough
        if (!util.isTouch) {
            document.body.addEventListener(moveEvt, this.checkPieceLost.bind(this))
        }
        pieceEl.addEventListener(stopEvt, this.markPieceRelease.bind(this));
    },
    
    markPieceHold: function(evt) {
        evt.preventDefault();
        function markHold(node) {
            util.dom.addClass(node, 'held');
        }
        
        var node = null, originalEvt = evt, ox = oy = 0;
        if (evt.changedTouches) {
            node = evt.changedTouches[0].target;
            originalEvt = evt.changedTouches[0];
        } else {
            this.mouseDragInProgress = true;
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
            util.dom.removeClass(node, 'held');
            node.parentNode.appendChild(node);
            return {
                id : node.id,
                x : parseInt(node.style.left, 10) + this.boardOffset.x,
                y : parseInt(node.style.top, 10) + this.boardOffset.y
            };
        }

        var node = null, updatedNodes = [];
        if (evt.changedTouches) {
            node = evt.changedTouches[0].target; 
        } else {
            this.mouseDragInProgress = false;
            node = evt.target;
        }
        updatedNodes.push(markRelease.bind(this)(node));

        this.fireEvent('piecemove', {nodes : updatedNodes});
    },
    
    checkPieceLost: function(evt) {
        if (this.mouseDragInProgress) {
            this.updatePiecePosition(evt);
        }
    },
    
    updatePiecePosition: function(evt) {
        evt.preventDefault();
        var self = this;
        function markMove(touch) {
            var node = touch.target,
                offset = self.boardOffset;
            
            var isHeld = util.dom.hasClass(node, 'held');
            //on desktop, leaving node area while moving mouse really fast
            //might leave the node in 'held' state, we find it and update it
            if (isHeld || (!isHeld && self.mouseDragInProgress && (node = document.querySelector('.puzzle-piece.held')))) {
                node.style.left = (touch.pageX - offset.x - node.dragOffset.x) + 'px';
                node.style.top = (touch.pageY - offset.y - node.dragOffset.y) + 'px';
            }
        }
        
        if (evt.changedTouches) { //touch
            markMove(evt.changedTouches[0]);
        } else {
            markMove(evt);
        }
    }
};

util.mixin(PZ.view.Board.prototype, PZ.event.observable);
PZ.view.Board.prototype.constructor = PZ.view.Board;

