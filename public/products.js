var socket = io('http://192.168.1.225:80', { transport : ['websocket'] });
function serverQuery () {
    socket.on('connect', function(data) {
        socket.emit('join', socket.id);
        fetch('/updateProducts', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                data: window.location.href,
                socketid: socket.id
            })
        })
    });
}

window.onload = serverQuery()


socket.on('messages', function(data) {
    console.log(data)
    for (product in data) {
        var title = data[product].Title
        var image = data[product].Image
        var description = data[product].Description
        var productKey = data[product].ProductKey

        console.log(productKey)

        var parent = document.createElement("div")
        parent.className = "card"
        parent.style.cssText = "margin: 10px 0px 10px 0px"
        parent.setAttribute("onClick", `items('${productKey}');`)
        var child = document.createElement("div")
        parent.appendChild(child)
        
        child.className = "card-header"
        var titleElem = document.createElement("h1")
        titleElem.innerText = title
        child.appendChild(titleElem)

        var descriptionElem = document.createElement("p")
        descriptionElem.innerText = description
        child.appendChild(descriptionElem)
        
        var imageElem = document.createElement("img")
        imageElem.setAttribute("src", image)
        child.appendChild(imageElem)

        document.body.appendChild(parent)
    }

});