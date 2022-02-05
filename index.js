var express = require('express');
var socket = require('socket.io');
// App setup
var app = express();
var server = app.listen(4000, function(){
    console.log('listening for requests on port 4000,');
});

// Static files
app.use(express.static('public'));


// Socket setup & pass server
var io = socket(server);
io.on('connection', (socket) => {

    console.log('made socket connection', socket.id);

    // Handle chat event
    socket.on('move', function(data){
        console.log(socket.id,data.from.i, data.from.j, "=>", data.to.i, data.to.j);
        // io.sockets.emit('move', data);
    });


});