namespace('PZ.view');

PZ.view.Board = function(controller) {
    this.controller = controller; //remove coupling, just register listener on events?
    this.boardEl = null;
    this.boardOffset = null;
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
        var shuffleEvt = util.isTouch ? 'touchstart' : 'mouseup';
        var listener = function(evt) {
            util.dom.removeClass(this.boardEl, "full");
            //unregister shuffle listener
            this.boardEl.removeEventListener(shuffleEvt, listener);
            this.fireEvent('shuffle', {});
        }.bind(this);
        
        this.boardEl.addEventListener(shuffleEvt, listener); 
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
        this.bindEvents();
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
                this.elPieces[id].parentNode.appendChild(this.elPieces[id]);
            }
            else {}
            util.mixin(this.elPieces[id].style, {
                left: (pieces[i].posX  - offset.x) + 'px',
                top: (pieces[i].posY  - offset.y) + 'px'
            });
        }
    },
   
    /** DnD **/
    bindEvents: function() {
        var events = util.isTouch ? ['touchstart', 'touchmove', 'touchend'] : ['mousedown', 'mousemove', 'mouseup'];
        
        this.dnd = {
            start : { name : events[0], handler: this.markPieceHold.bind(this) },
             //touch felt a bit laggy - decreasing callback frequency to ~25fps
            move : { name : events[1], handler: util.isTouch ? util.throttle(this.updatePiecePosition.bind(this), 40) : this.updatePiecePosition.bind(this) },
            end : { name : events[2], handler: this.markPieceRelease.bind(this) }
        };
        
        document.body.addEventListener(this.dnd.start.name, this.dnd.start.handler );
    },
    
    markPieceHold: function(evt) {
        evt.preventDefault();

        var node = evt.changedTouches ? evt.changedTouches[0].target : evt.target, 
            originalEvt = evt.changedTouches ? evt.changedTouches[0] : evt, ox = 0, oy = 0;
            
        //listen to piece events only
        if (!util.dom.hasClass(node, 'puzzle-piece')) {
            return;
        }
        
        //calculate offset within a piece when piece is grabbed
        ox = (originalEvt.pageX - this.boardOffset.x) - parseInt(node.style.left) ;
        oy = (originalEvt.pageY - this.boardOffset.y) - parseInt(node.style.top);
        node.dragOffset = {x: ox, y: oy};
        util.dom.addClass(node, 'held');
        
        //bind move and end handler
        var b = document.body;
        b.addEventListener(this.dnd.move.name, this.dnd.move.handler);
        b.addEventListener(this.dnd.end.name, this.dnd.end.handler );
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
            node = evt.target;
        }
        
        //remove move handler
        var b = document.body;
        b.removeEventListener(this.dnd.move.name, this.dnd.move.handler);
        b.removeEventListener(this.dnd.end.name, this.dnd.end.handler );

        
        updatedNodes.push(markRelease.bind(this)(node));

        this.fireEvent('piecemove', {nodes : updatedNodes});
    },
    
    updatePiecePosition: function(evt) {
        evt.preventDefault();
        
        var node = evt.changedTouches ? evt.changedTouches[0].target : evt.target,
            offset = this.boardOffset,
            isHeld = util.dom.hasClass(node, 'held');
            
        //on desktop, leaving node area while moving mouse really fast
        //might leave the node in 'held' state, we find it and update it
        if (isHeld || (!isHeld && (node = document.querySelector('.puzzle-piece.held')))) {
            node.style.left = (evt.pageX - offset.x - node.dragOffset.x) + 'px';
            node.style.top = (evt.pageY - offset.y - node.dragOffset.y) + 'px';
        }
    }
};

util.mixin(PZ.view.Board.prototype, PZ.event.observable);
PZ.view.Board.prototype.constructor = PZ.view.Board;

