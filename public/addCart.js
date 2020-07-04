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
            console.log(data)
        });
      });
  });