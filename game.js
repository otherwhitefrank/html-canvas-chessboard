/**
 * Created by frank on 11/6/14.
 */

var Game = {};

Game.fps = 60;

Game.initialize = function() {
    init_canvas();
    add_event_listener_mousedown(event_listener_mousedown);
    add_event_listener_mouseup(event_listener_mouseup);
    add_event_listener_mousemove(event_listener_mousemove);
    init_board();
    init_pieces();
    draw_board();
};



Game.draw = function() {
    //First clear rect
    context.clearRect(0, 0, elem.width, elem.height);


    //Draw the board
    draw_board();

    for (var i=0; i < pieces.length; i++) {
        drawPiece(pieces[i]);
    }
};

Game.update = function() {

    for (var i=0; i < pieces.length; i++) {
        pieces[i].update();
    }
};
