//initialise socket connection
var socket = io('http://192.168.1.225:80', { transport : ['websocket'] });
socket.on('connect', function(data) {
    socket.emit('join', socket.id);
});



socket.on('messages', function(data) {
    //var redirect_location = "/product?" + data
});


