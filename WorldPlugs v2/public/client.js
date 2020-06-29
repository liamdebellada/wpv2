var socket = io('http://fbbsvr.ddns.net:80', { transport : ['websocket'] });
socket.on('connect', function(data) {
    socket.emit('join', socket.id);
});

socket.on('messages', function(data) {
    var redirect_location = "/product?" + data;
    window.location.href = redirect_location
});

function products(categoryKey) {
    fetch('/getproducts', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        body: JSON.stringify({
            categoryKey: categoryKey,
            socketid: socket.id
        })
    })
}

function items(itemKey) {
    var redirect_location = "/item?" + itemKey;
    window.location.href = redirect_location
}