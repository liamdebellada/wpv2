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
                document.getElementById("fixed-alert").innerText = data
                $("#alertMsg").collapse('show');
                setTimeout(function(){$("#alertMsg").collapse('hide');}, 2000)
            } else {
                displayBasketContent(data)
            }
        });
      });
  });

