window.addEventListener("load", function(){
    $("button.addToCart").click(function () {
        x = $(this)[0].attributes[1].textContent
        quantity = document.getElementById(x).value
        $.ajax({
            type: "POST",
            url: "/updateCart",
            data: {
                items: x,
                quantity: quantity
            }
        }).done(data => {
            if (typeof(data) != "object") {
                console.log("item already in basket")
                document.getElementById("alertMsg").style.display = "block";
            } else {
                displayBasketContent(data)
            }
        });
      });
  });