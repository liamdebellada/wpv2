function displayBasketContent(basketContent) {
    var basket = document.getElementById("modalBody")
    var total = 0;
    if (basketContent == "e") {
        basket.innerHTML = "<div style='text-align: center;'><text>Your basket is empty</text></div>"
        // document.getElementById("basket-items-quantity").innerText = ""
        $(".basket-items-quantity").text("")
        $("#captchaSubmission").hide()
        $(".g-recaptcha").hide()

    } else {
        basket.innerHTML = ""
        // document.getElementById("basket-items-quantity").innerText = basketContent.length
        $(".basket-items-quantity").text(basketContent.length)
        $("#captchaSubmission").show()
        $(".g-recaptcha").show()
        basketContent.forEach(function (row) {
            var item = row[0]
            var quantity = row[1]
            var basketRow = document.createElement("DIV")
            total = total + parseFloat(item.Price) * parseInt(quantity)
            var rowContent = `
            <div>
            <text>${item.Title}</text>
            <div class="propertyContainer" style="float:right;">
            <input id="${item._id}" type="number" pattern="[0-9]*" value="${quantity}" min="1" max="${item.Stock}" class="itemQuantity" onchange="updateQuantity(this)" style="width: 50px;"></input>
            <input id="${item._id}" class="remove-small-cart-button" type="submit" onclick="removeItem(this)" value="&times;"></div>
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
    $('.circle-loader').css("display", "inline-block")
    $('#confirmation-button').toggle()
    $.ajax({
        type: "POST",
        url: "/confirmPayment",
        data: {
            paymentId: client_paymentId,
            payerId: client_payerId
        }
    }).done(data => {
        if (data == '/success') {

            $('.circle-loader').toggleClass('load-complete');
            $('.checkmark').toggle();

            setTimeout(function () {

                window.location.href = data

            }, 1500);

        } else {
            window.location.href = data
        }


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
    try {
        var stock = document.getElementsByClassName("itemStock")
        for (item in stock) {
            if (stock[item].innerText == "0") {
                stock[item].style.color = "#ea6464"
                stock[item].innerText = "Out of stock"
            }
        }
    
        var buttons = document.getElementsByClassName("0")
        for (item in buttons) {
            buttons[item].disabled = true;
            buttons[item].classList.remove("wp-button-default-hover");
            //buttons[item].style.backgroundColor = "#ea6464"
            buttons[item].innerText = "Unavaliable"
            buttons[item].cssText = "border-image-slice: 0;"
        }
    } catch{
    }
    
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
        displayBasketContent(data)
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

var prevScrollpos = window.pageYOffset;
window.onscroll = function () {
    var currentScrollPos = window.pageYOffset;
    if (document.body.scrollTop > 80 || document.documentElement.scrollTop > 80) {
        document.getElementById("navbar").style.top = "-75px"; //up
        document.getElementById("fixed-navbar-row").style.top = "0";
        $(".dropdown-item").css("margin", "0.25rem 0 0");
        document.getElementById("fixed-navbar-content-items-toggle").style.lineHeight = "58px";
        $("#fixed-navbar-content-icons-search-toggle, #fixed-navbar-content-icons-basket-toggle, #fixed-navbar-content-icons-quantity-toggle").show();

    } else {
        document.getElementById("navbar").style.top = "0"; //down (defualt view)
        $(".dropdown-item").css("margin", "0.625rem 0 0");
        document.getElementById("fixed-navbar-row").style.top = "0";
        document.getElementById("fixed-navbar-content-items-toggle").style.lineHeight = "30px";
        $("#fixed-navbar-content-icons-search-toggle, #fixed-navbar-content-icons-basket-toggle, #fixed-navbar-content-icons-quantity-toggle").hide();
    }
    prevScrollpos = currentScrollPos;
}

let typingTimer;
let doneTypingInterval = 100;  
let myInput = document.getElementById('searched');

myInput.addEventListener('keyup', () => {
    clearTimeout(typingTimer);
    if (myInput.value) {
        typingTimer = setTimeout(function() {doneTyping(myInput.value)}, doneTypingInterval);
    }
    else if (myInput.value == "") {
        doneTyping(myInput.value)
    } 
});

function drawSearchResults(data) {
    var resultsField = document.getElementById("search-results")
    resultsField.innerHTML = ""

    if (typeof(data) == "object") {
        data.forEach(function(item) {     
            var resultArea = document.createElement("DIV")
            var rowContent = `
            <div>
            <text>${item.Title}</text>
            <div class="propertyContainer" style="float:right;">
            <a href="/products/${item.CategoryKey}/items/${item.ProductKey}" class="btn wp-button wp-button-gradient wp-button-checkout">View Product</a>
            </div>
            </div>
            <hr/>
            `
    
            resultArea.innerHTML = rowContent
    
            resultsField.append(resultArea)
        })
    } else {
        resultsField.innerHTML = data;
    }
}


function doneTyping (query) {
    $.ajax({
        type: "POST",
        url: "/searchData",
        data: {
            searchQuery: query
        }
    }).done(data => {
        drawSearchResults(data)
    });
}