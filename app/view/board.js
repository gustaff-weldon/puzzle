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
        var left = parseInt(node.style.left, 10),
            top =  parseInt(node.style.top, 10);
        ox = (originalEvt.pageX - this.boardOffset.x) - left ;
        oy = (originalEvt.pageY - this.boardOffset.y) - top;
        node.dragOffset = {x: ox, y: oy};
        node.pos = {top: top, left: left};
        util.dom.addClass(node, 'held');
        util.dom.addClass(node, 'held-main');

        //mark group pieces as well
        this._groupOperation(node, function(node, groupNode) {
            util.dom.addClass(groupNode, 'held');
            node.group.
            groupNode.pos = {
                left: parseInt(groupNode.style.left, 10),
                top: parseInt(groupNode.style.top, 10)
            };
        });
        
        //bind move and end handler
        var b = document.body;
        b.addEventListener(this.dnd.move.name, this.dnd.move.handler);
        b.addEventListener(this.dnd.end.name, this.dnd.end.handler );
    },
    
    markPieceRelease: function(evt){
        evt.preventDefault();
        
        function markRelease(node){
            delete node.dragOffset;
            delete node.pos;
            util.dom.removeClass(node, 'held');
            util.dom.removeClass(node, 'held-main');
            node.parentNode.appendChild(node);
            return {
                id : node.id,
                x : parseInt(node.style.left, 10) + this.boardOffset.x,
                y : parseInt(node.style.top, 10) + this.boardOffset.y
            };
        }

        var node = evt.changedTouches ? node = evt.changedTouches[0].target : evt.target, updatedNodes = [];
        
        //remove move handler
        var b = document.body;
        b.removeEventListener(this.dnd.move.name, this.dnd.move.handler);
        b.removeEventListener(this.dnd.end.name, this.dnd.end.handler );

        //mark node as updated
        updatedNodes.push(markRelease.bind(this)(node));
        
        //also mark group nodes if any, since these has been moved as well
        this._groupOperation(node, function(node, groupNode) {
            updatedNodes.push(markRelease.bind(this)(groupNode));
        });
        
        this.fireEvent('piecemove', {nodes : updatedNodes});
    },
    
    updatePiecePosition: function(evt) {
        /** TODO PERFORMANCE IMPROVEMENTS, that suck... remove offset? remove parse int, store int in node
        improve group operation performance (groups do not change during dnd - until drop)
        **/
        evt.preventDefault();
        
        var	evt =  evt.changedTouches ? evt.changedTouches[0] : evt,
            node = evt.target,
            offset = this.boardOffset;//,
            isHeld = node.dragOffset;
            
        //on desktop, leaving node area while moving mouse really fast
        //might leave the node in 'held' state, we find it and update it
        if (isHeld || (!isHeld && (node = document.querySelector('.puzzle-piece.held-main')))) {
            var newX = (evt.pageX - offset.x - node.dragOffset.x),
                newY = (evt.pageY - offset.y - node.dragOffset.y),
                moveX = newX - node.pos.left, 
                moveY = newY - node.pos.top;
            
            node.pos.left = newX;
            node.pos.top = newY;
            
            //update piece position
            node.style.left = newX + 'px';
            node.style.top = newY + 'px';
            
            //update group elements positions accoridngly (if any)
            // when we grab a piece that has been matched, we want the whole group to move with that piece
            this._groupOperation(node, function(node, groupNode) {
                var left = groupNode.pos.left + moveX, 
                    top = groupNode.pos.top + moveY;
                groupNode.style.left = left + 'px';
                groupNode.style.top = top + 'px';
                groupNode.pos.left = left;
                groupNode.pos.top = top;
            });
        }
    },
    
    _groupOperation: function(node, operation) {
        var model = this.controller.model, 
            gid  = model.pieceMap[node.id].groupId; 
        if (gid) {
            model.matchGroups[gid].forEach(function(id){
                if (id === node.id) {
                    return;
                }
                var groupNode = this.elPieces[id];
                operation.call(this, node, groupNode);
            }.bind(this));
        }
    }
};

util.mixin(PZ.view.Board.prototype, PZ.event.observable);
PZ.view.Board.prototype.constructor = PZ.view.Board;

