namespace('PZ');

PZ.Game  = function() {
    this.view = null;
    this.model = null;
};

PZ.Game.TOP = 1;
PZ.Game.RIGHT = 2;
PZ.Game.BOTTOM = 3;
PZ.Game.LEFT = 4;

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
            matchGroups: {},
            matchDeltaX: util.isTouch ? 30 : 15,
            matchDeltaY: util.isTouch ? 30 : 15,
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

        function generateId(x,y) {
            return 'p_' + x + '_' + y;
        }
        
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
                    //edge elements do not have at least one neighbour,
                    // but that will be taken into account
                    nearest:[
                        {
                           rel: PZ.Game.TOP,
                           id: generateId(x,y-1)
                        },
                        {
                            rel: PZ.Game.RIGHT,
                            id: generateId(x+1,y)
                        },
                        {
                            rel: PZ.Game.BOTTOM,
                            id: generateId(x,y+1)
                        },
                        {
                            rel: PZ.Game.LEFT,
                            id: generateId(x-1,y)
                        }
                    ]
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
        var matchedPieces = [], piece, i,
            dx = this.model.matchDeltaX,
            dy = this.model.matchDeltaY;

        changedPieces.forEach(function(change) {
            //retrieve pieces from model and set their new position
            piece = this.model.pieceMap[change.id];
            piece.posX = change.x;
            piece.posY = change.y;

            //check if piece is near enough one of its neighbours to be matched
            for (i = 0; i < 4; i++)  {
                var matchResult,
                    neighbour = this.model.pieceMap[piece.nearest[i].id];

                if (neighbour) {
                    matchResult = pieceMatch(piece, neighbour, piece.nearest[i].rel, dx, dy);
                    if (matchResult.matched) {
                        //piece matched, set new position that aligns it to matched neighbour
                        piece.posX+=matchResult.diffx;
                        piece.posY+=matchResult.diffy;
                        matchedPieces.push(piece.id);
                        //update match groups
                        this.updateMatchGroups(piece, neighbour);
                        break;
                    }
                }
            }
        }.bind(this));

        //inform about found matches
        if (matchedPieces.length) {
            this.fireEvent('modelUpdated', {
                model: this.model,
                matched: matchedPieces
            });
        }

        function pieceMatch(matchee, reference, relation, dx, dy) {
            var pw = piece.width, ph = piece.height,
                result = {matched: false};
            //distance between centers of pieces should be equal to width,height with delta allowance
            var mx = matchee.posX, my = matchee.posY,
                rx = reference.posX, ry = reference.posY,
                diffx = 0, diffy = 0;

            switch (relation) { //adjust matchee position (put near ref point to check delta)
                case PZ.Game.TOP: my-=ph; break;
                case PZ.Game.RIGHT: mx+=pw; break;
                case PZ.Game.BOTTOM:my+=ph; break;
                case PZ.Game.LEFT:mx-=pw; break;
            }

            diffx = rx - mx;
            diffy = ry - my;

            result.matched = Math.abs(diffx) <= dx && Math.abs(diffy) <= dy;
            result.diffx = diffx;
            result.diffy = diffy;
            if (result.matched){
                util.log('Matched:', matchee.id, 'to', reference.id, relation, 'Result', result);
            }
            return result;
        }
    },

    updateMatchGroups: function(matchee, reference) {
        var refGid = reference.groupId,
            matchGid = matchee.groupId;
        //util.log('match groups: ', 'refgid ', refGid, ' matchGid ', matchGid, matchee, reference);
        if (refGid) { //append to reference group
            if (matchGid && matchGid !== refGid) { //second condition should always be true after groups are implemented in view
                this.model.matchGroups[matchGid].forEach(function(id){
                    this.model.pieceMap[id].groupId = refGid;
                }.bind(this));
                this.model.matchGroups[refGid] = this.model.matchGroups[refGid].concat(this.model.matchGroups[matchGid]);
                delete this.model.matchGroups[matchGid];
            } else {
                this.model.matchGroups[refGid].push(matchee.id);
            }
            matchee.groupId = refGid;
        } else if (matchGid) { //append to matchee group
            this.model.matchGroups[matchGid].push(reference.id);
            reference.groupId = matchGid;
        } else { //create new match group
            this.model.matchGroups['g_' + matchee.id] = [matchee.id, reference.id];
            matchee.groupId = reference.groupId = 'g_' + matchee.id;
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
        //util.log(ids.length + ' piece(s) updated: ', ids);
        this.performMatching(ids);
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

