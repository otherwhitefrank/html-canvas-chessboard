/**
 * Created by frank on 11/6/14.
 */
//Global variables for canvas context
var elem,
    elemLeft,
    elemTop,
    context,
    elements = [],
    pieces = [],
    animT = .2,
    WATCHING_CLICK_EVENT = false,
    selected_piece;

//Define a piece

var Piece = function (x, y, img_url) {
    this.x = x;
    this.y = y;

    //75px pieces
    this.width = 75;
    this.height = 75;

    //Where the piece is trying to move to, used for linear interpolation
    this.moveX = x;
    this.moveY = y;

    //If a user clicks on an image it will not likely be the upper right hand corner
    //however, all are positioning is down from top left coordinates.
    //So instead on mousedown we keep track of the position relative to top,left and add this diff
    //into any transformation.
    this.clickDiffX = 0;
    this.clickDiffY = 0;

    //Open our image
    this.img =  new Image;
    this.img.src = img_url;
};

Piece.prototype.validMove = function(x, y) {
    this.moveX = x;
    this.moveY = y;
};

Piece.prototype.clickWithinPiece = function(x, y) {
    return (y > this.y && y < this.y + this.height && x > this.x && x < this.x + this.width);
};

Piece.prototype.update = function() {
    var delta = 1; //If values are within 1 pixel then set x to moveX and y to moveY

    if (this.x != this.moveX){
        this.x = this.lerp(this.x, this.moveX, animT);
        if (Math.abs(this.moveX - this.x) < delta)
        {
            this.x = this.moveX;
        }
    }

    if (this.y != this.moveY){
        this.y = this.lerp(this.y, this.moveY, animT);
        if (Math.abs(this.moveY - this.y) < delta)
        {
            this.y = this.moveY;
        }
    }

};

Piece.prototype.lerp = function(v0, v1, t) {
    // Precise method which guarantees v = v1 when t = 1.

    return (1-t)*v0 + t*v1;
};

$(document).ready(function () {
    Game.initialize();

    Game.run = (function() {
        var loops = 0, skipTicks = 1000 / Game.fps,
            maxFrameSkip = 10,
            nextGameTick = (new Date).getTime();

        return function() {
            loops = 0;

            while ((new Date).getTime() > nextGameTick) {
                updateStats.update();
                Game.update();
                nextGameTick += skipTicks;
                loops++;
            }

            renderStats.update();
            Game.draw();
        };
    })();

    window.setInterval(Game.run, 0);

});

function init_canvas() {
    elem = document.getElementById('myCanvas'),
        elemLeft = elem.offsetLeft,
        elemTop = elem.offsetTop,
        context = elem.getContext('2d'),
        elements = [];
}

function event_listener_mousedown(piece, event) {
    WATCHING_CLICK_EVENT = true;

    var x = event.pageX - elemLeft,
        y = event.pageY - elemTop;


    selected_piece = piece;

    //Save click diff
    selected_piece.clickDiffX = x - selected_piece.x;
    selected_piece.clickDiffY = y - selected_piece.y;

    selected_piece.moveX = x - selected_piece.clickDiffX;
    selected_piece.moveY = y - selected_piece.clickDiffY;

}

function event_listener_mouseup(piece, event) {
    WATCHING_CLICK_EVENT = false;

    var x = event.pageX - elemLeft,
        y = event.pageY - elemTop;

    selected_piece.moveX = x - selected_piece.clickDiffX;
    selected_piece.moveY = y - selected_piece.clickDiffY;
}

function event_listener_mousemove(piece, event) {

    var x = event.pageX - elemLeft,
        y = event.pageY - elemTop;

    selected_piece.moveX = x - selected_piece.clickDiffX;
    selected_piece.moveY = y - selected_piece.clickDiffY;
}

function add_event_listener_mousedown(callback) {
    // Add event listener for `click` events.
    elem.addEventListener('mousedown', function (event) {
        var x = event.pageX - elemLeft,
            y = event.pageY - elemTop;

        // Collision detection between clicked offset and element.
        pieces.forEach(function (piece) {
            if (piece.clickWithinPiece(x, y)) {
                callback(piece, event);
            }
        });

    }, false);
}

function add_event_listener_mousemove(callback) {
    // Add event listener for `click` events.


    elem.addEventListener('mousemove', function (event) {

        if (WATCHING_CLICK_EVENT) {
            var x = event.pageX - elemLeft,
                y = event.pageY - elemTop;

            // Collision detection between clicked offset and element.
            pieces.forEach(function (piece) {
                if (piece === selected_piece) {
                    callback(piece, event);
                }
            });
        }

    }, false);
}

function add_event_listener_mouseup(callback) {
    elem.addEventListener('mouseup', function (event) {
        var x = event.pageX - elemLeft,
            y = event.pageY - elemTop;

        if (WATCHING_CLICK_EVENT) {
            // Collision detection between clicked offset and element.
            pieces.forEach(function (piece) {
                if (piece === selected_piece) {
                    callback(piece, event);
                }
            });
        }

    }, false);
}

function init_board() {
    //Create two fill styles, one black, one white
    var fillBlack = '#FFFFFF';
    var fillWhite = '#000000';

    var flipflop = true;

    var i, j;
    for (i = 0; i < 8; i++) {
        for (j = 0; j < 8; j++) {
            if (flipflop) {
                //Add white block
                elements.push({
                    colour: fillBlack,
                    width: 75,
                    height: 75,
                    top: i * 75,
                    left: j * 75
                });

            }
            else {
                //Print black
                elements.push({
                    colour: fillWhite,
                    width: 75,
                    height: 75,
                    top: i * 75,
                    left: j * 75
                });
            }

            //Flip over our flipflop
            flipflop = flipflop ? false : true;

        }

        flipflop = flipflop ? false : true;

    }

};

function draw_board() {



    // Render elements.
    elements.forEach(function (element) {
        context.fillStyle = element.colour;
        context.fillRect(element.left, element.top, element.width, element.height);
    });
}

function drawPiece(piece) {
    //Acquire the image.onload () function and overload it to draw at a space
    //piece.img.onload = function() {
        context.drawImage(piece.img, piece.x, piece.y);
    //}

}

function init_pieces() {

    //Draw all White!

    //Draw white rook 1 and 2
    var whiteRook1 = new Piece(0, 0, 'chess_pieces/Chess_symbols_r2_c3.png');
    pieces.push(whiteRook1);

    var whiteRook2 = new Piece(525, 0, 'chess_pieces/Chess_symbols_r2_c3.png');
    pieces.push(whiteRook2);


    //Draw white knight 1 and 2
    var whiteKnight1 = new Piece(75, 0, 'chess_pieces/Chess_symbols_r2_c4.png');
    pieces.push(whiteKnight1);

    var whiteKnight2 = new Piece(450, 0, 'chess_pieces/Chess_symbols_r2_c4.png');
    pieces.push(whiteKnight2);


    //Draw white bishop 1 and 2
    var whiteBishop1 = new Piece(150, 0, 'chess_pieces/Chess_symbols_r2_c5.png');
    pieces.push(whiteBishop1);

    var whiteBishop2 = new Piece(375, 0, 'chess_pieces/Chess_symbols_r2_c5.png');
    pieces.push(whiteBishop2);

    //Draw white king
    var whiteKing = new Piece(225, 0, 'chess_pieces/Chess_symbols_r2_c6.png');
    pieces.push(whiteKing);

    //Draw white queen
    var whiteQueen = new Piece(300, 0,'chess_pieces/Chess_symbols_r2_c7.png' );
    pieces.push(whiteQueen);

    //Draw white pawns
    var whitePawn1 = new Piece(0, 75, 'chess_pieces/Chess_symbols_r2_c2.png');
    pieces.push(whitePawn1);
    var whitePawn2 = new Piece(75, 75, 'chess_pieces/Chess_symbols_r2_c2.png');
    pieces.push(whitePawn2);
    var whitePawn3 = new Piece(150, 75, 'chess_pieces/Chess_symbols_r2_c2.png');
    pieces.push(whitePawn3);
    var whitePawn4 = new Piece(225, 75, 'chess_pieces/Chess_symbols_r2_c2.png');
    pieces.push(whitePawn4);
    var whitePawn5 = new Piece(300, 75, 'chess_pieces/Chess_symbols_r2_c2.png');
    pieces.push(whitePawn5);
    var whitePawn6 = new Piece(375, 75, 'chess_pieces/Chess_symbols_r2_c2.png');
    pieces.push(whitePawn6);
    var whitePawn7 = new Piece(450, 75, 'chess_pieces/Chess_symbols_r2_c2.png');
    pieces.push(whitePawn7);
    var whitePawn8 = new Piece(525, 75, 'chess_pieces/Chess_symbols_r2_c2.png');
    pieces.push(whitePawn8);


    //Draw all Black!

    //Draw black rook 1 and 2
    var blackRook1 = new Piece(0, 450, 'chess_pieces/Chess_symbols_r4_c3.png');
    pieces.push(blackRook1);

    var blackRook2 = new Piece(525, 450, 'chess_pieces/Chess_symbols_r4_c3.png');
    pieces.push(blackRook2);


    //Draw black knight 1 and 2
    var blackKnight1 = new Piece(75, 450, 'chess_pieces/Chess_symbols_r4_c4.png');
    pieces.push(blackKnight1);

    var blackKnight2 = new Piece(450, 450, 'chess_pieces/Chess_symbols_r4_c4.png');
    pieces.push(blackKnight2);


    //Draw black bishop 1 and 2
    var blackBishop1 = new Piece(150, 450, 'chess_pieces/Chess_symbols_r4_c5.png');
    pieces.push(blackBishop1);

    var blackBishop2 = new Piece(375, 450, 'chess_pieces/Chess_symbols_r4_c5.png');
    pieces.push(blackBishop2);

    //Draw black king
    var blackKing = new Piece(225, 450, 'chess_pieces/Chess_symbols_r4_c6.png');
    pieces.push(blackKing);

    //Draw black queen
    var blackQueen = new Piece(300, 450, 'chess_pieces/Chess_symbols_r4_c7.png');
    pieces.push(blackQueen);

    //Draw black pawns
    var blackPawn1 = new Piece(0, 525, 'chess_pieces/Chess_symbols_r4_c2.png');
    pieces.push(blackPawn1);
    var blackPawn2 = new Piece(75, 525, 'chess_pieces/Chess_symbols_r4_c2.png');
    pieces.push(blackPawn2);
    var blackPawn3 = new Piece(150, 525, 'chess_pieces/Chess_symbols_r4_c2.png');
    pieces.push(blackPawn3);
    var blackPawn4 = new Piece(225, 525, 'chess_pieces/Chess_symbols_r4_c2.png');
    pieces.push(blackPawn4);
    var blackPawn5 = new Piece(300, 525, 'chess_pieces/Chess_symbols_r4_c2.png');
    pieces.push(blackPawn5);
    var blackPawn6 = new Piece(375, 525, 'chess_pieces/Chess_symbols_r4_c2.png');
    pieces.push(blackPawn6);
    var blackPawn7 = new Piece(450, 525, 'chess_pieces/Chess_symbols_r4_c2.png');
    pieces.push(blackPawn7);
    var blackPawn8 = new Piece(525, 525, 'chess_pieces/Chess_symbols_r4_c2.png');
    pieces.push(blackPawn8);


    // Render pieces.
    pieces.forEach(function (piece) {
        drawPiece(piece);
    })

}

//Helper function to return the square from X/Y coords
function getSquareFromXY(x, y) {
    return {column: (x / 75)}
}

