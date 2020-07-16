function displayBasketContent(basketContent) {
    var basket = document.getElementById("modalBody")
    var total = 0;
    if (basketContent == "e") {
        basket.innerHTML = "<div style='text-align: center;'><text>Your basket is empty</text></div>"
        console.log("your session basket is empty")
        // document.getElementById("basketQuantity").innerText = ""
        $(".basketQuantity").text("")
        $(".checkoutBtn").hide()
        
    } else {
        basket.innerHTML = ""
        // document.getElementById("basketQuantity").innerText = basketContent.length
        $(".basketQuantity").text(basketContent.length)
        $(".checkoutBtn").show()
        basketContent.forEach(function (row) {
            var item = row[0]
            var quantity = row[1]
            var basketRow = document.createElement("DIV")
            total = total + parseFloat(item.Price)
            var rowContent = `
            <div>
            <text>${item.Title}</text>
            <div class="propertyContainer" style="float:right;">
            <input id="${item._id}" type="number" pattern="[0-9]*" value="${quantity}" min="1" max="${item.Stock}" class="itemQuantity" onchange="updateQuantity(this)" style="width: 50px;"></input>
            <input id="${item._id}" class="button" type="submit" onclick="removeItem(this)" value="&times;"></div>
            </div>
            </div>
            <hr/>
            `
    
            basketRow.innerHTML = rowContent
            // modal-body
    
            basket.append(basketRow)
        });
        var totalText = document.createElement("text").innerText = "Total: £" + total.toFixed(2)
        basket.append(totalText)
    }
    
}

function confirmPayment() {
    $.ajax({
        type: "POST",
        url: "/confirmPayment",
        data: {
            paymentId: client_paymentId,
            payerId: client_payerId 
        }
    }).done(data => {
        window.location.href = data
    });
}

window.addEventListener("load", function () {
    $.ajax({
        type: "POST",
        url: "/getCart",
        data: {}
    }).done(data => {
        displayBasketContent(data)
    });
});

function removeItemCart(item) {
    $.ajax({
        type: "POST",
        url: "/removeCart",
        data: {
            id: item.id
        }
    }).done(data => {
        window.location.href = "/cart"
    });
}

function removeItem(item) {
    //console.log(item.id) //id for specific item to be removed

    $.ajax({
        type: "POST",
        url: "/removeCart",
        data: {
            id: item.id
        }
    }).done(data => {
        displayBasketContent(data)
        if (window.location.href.includes("/cart")) {
            window.location.href = "/cart"
        }
    });
    //reload to update page. Could use Ajax, however it wouldnt work with ejs since we render the page statically.
}

function updateQuantity(item) {
    try {
        value = parseInt(item.value)
    } catch {
        console.log("Not a number") //Send back user alert error.
    }

    

    if (value > item.max) {
        item.value = item.max
    }
    if (value < item.min) {
        item.value = item.min
    }

    $.ajax({
        type: "POST",
        url: "/updateQuantity",
        data: {
            id: item.id,
            quantity: item.value
        }
    }).done(data => {
        console.log(data)
    });
}

function executePayment() {
    $.ajax({
        type: "POST",
        url: "/executePayment",
        data: {}
    }).done(data => {
        window.location.href = data //redirect to confirm payment
    });
}