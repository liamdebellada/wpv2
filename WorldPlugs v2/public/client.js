var socket = io('http://fbbsvr.ddns.net:80', { transport : ['websocket'] });
socket.on('connect', function(data) {
    socket.emit('join', socket.id);
});

socket.on('messages', function(data) {
    //var redirect_location = "/product?" + data
});