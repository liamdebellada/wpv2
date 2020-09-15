function displayBasketContent(basketContent) {
    var basket = $('#wp-side-basket-items')
    var total = 0;
    if (basketContent == "e") {
        basket.html("<div style='text-align: center;'><text>Your basket is empty</text></div>")
        $(".basket-items-quantity").text("")
        $("#captchaSubmission, .g-recaptcha, #wp-side-basket-price-table").hide()

    } else {
        $("#wp-side-basket-price-table").show()
        basket.html("")
        $(".basket-items-quantity").text(basketContent.length)
        $("#captchaSubmission").show()
        $(".g-recaptcha").show()
        basketContent.forEach(function (row) {
            var item = row[0]
            var quantity = row[1]
            var basketRow = document.createElement("DIV")
            total = total + parseFloat(item.Price) * parseInt(quantity)
            var rowContent = 
            `
                <div style="display: flex; align-items: center; margin-bottom: 0.825rem; background-color: #0d0c11; padding: 0.425rem; border-radius: 5px;">
                    <div>
                        <text class="text-left" style="font-size: 0.9175rem; display:block; color: white;">${item.Title}</text>
                        <text class="text-left" style="font-size: 0.9175rem; display:block; color: white;">£${item.Price}</text>
                    </div>
                    <div style="margin-left: auto; position: relative">
                        <input id="${item._id}" style="outline: none;" class="remove-small-cart-button" type="submit" onclick="removeItem(this)" value="&times;">
                    </div>
                </div>
            `

            basketRow.innerHTML = rowContent
            // modal-body

            basket.append(basketRow)
        });

        fee = parseFloat((total / 100 * 2.9 + 0.30).toFixed(2))

        $("#wp-side-basket-subtotal").text('£' + total.toFixed(2))
        $("#wp-side-basket-fee").text('£' + fee.toFixed(2))
        $("#wp-side-basket-total").text('£' + (total + fee).toFixed(2))

        // feeText.innerText = "Fee: £" + (total / 100 * 0.29 + 0.30).toFixed(2)
        // totalText.innerText = 
    }

}


function confirmPayment() {
    $('.wp-confirmation-animation').css("display", "inline-block")
    $('#confirmation-button').toggle()
    $.ajax({
        type: "POST",
        url: "/confirmPayment",
    }).done(data => {
        if (data == '/success') {

            $('.wp-confirmation-animation').toggleClass('load-complete');
            $('.wp-confirmation-checkmark').toggle();

            setTimeout(function () {

                window.location.href = data

            }, 1500);

        } else {
            window.location.href = data
        }


    });
}

$.ajax({
    type: "POST",
    url: "/getCart",
    data: {}
}).done(data => {
    displayBasketContent(data)
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
    $.ajax({
        type: "POST",
        url: "/removeCart",
        data: {
            id: item.id
        }
    }).done(data => {
        console.log(data)
        displayBasketContent(data)
        if (window.location.href.includes("/cart")) {
            window.location.href = "/cart"
        }
    });
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

    $("#wp-redirect-overlay").fadeIn()
}

window.onload = function() {
    
    $('[data-toggle="tooltip"]').tooltip();   
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
        try {
            document.getElementById("fixed-alert").style.position = "fixed"
            document.getElementById("fixed-alert").style.top = "45px"
        } catch {}
    } else {
        document.getElementById("navbar").style.top = "0"; //down (defualt view)
        $(".dropdown-item").css("margin", "0.625rem 0 0");
        document.getElementById("fixed-navbar-row").style.top = "0";
        document.getElementById("fixed-navbar-content-items-toggle").style.lineHeight = "30px";
        $("#fixed-navbar-content-icons-search-toggle, #fixed-navbar-content-icons-basket-toggle, #fixed-navbar-content-icons-quantity-toggle").hide();
        try {
            document.getElementById("fixed-alert").style.position = "relative"
            document.getElementById("fixed-alert").style.top = "0"
        } catch {}
    }
    prevScrollpos = currentScrollPos;
}

let myInput = $('#searched');
let typingTimer;
let doneTypingInterval = 100;  


myInput.keyup( () => {
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
            <div style="display: flex; align-items: center;">
            <text>${item.Title}</text>
            <a href="/products/${item.CategoryKey}/items/${item.ProductKey}" class="btn wp-button wp-button-gradient wp-button-default-hover" style="margin-left: auto;" >View Product</a>
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
