window.addEventListener("load", function(){
    $("button.addToCart").click(function () {
        x = $(this)[0].id
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
                document.getElementById("alertMsg").style.display = "block";
                document.getElementById("alertMsg").innerText = data;
            } else {
                displayBasketContent(data)
            }
        });
      });
  });

