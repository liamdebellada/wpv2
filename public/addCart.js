window.addEventListener("load", function(){
    $("button.wp-button-add-to-cart").click(function () {
        $.ajax({
            type: "POST",
            url: "/updateCart",
            data: {
                items: $(this).parent().attr('id'),
                quantity: $(this).siblings('input').val()
            }
        }).done(data => {

            if (typeof(data) != "object") {
                
                var wp_cart_text = data
                
            } else {

                var wp_cart_text = data.Item
                
                displayBasketContent(data.userCart)   
            }

            $(`<div class="wp-cart-alert"><div class="wp-cart-alert-information"><text>${wp_cart_text}</text></div></div>`).promise().done(function() {
                if (typeof(data) != "object") { 
                    $(this).find('.wp-cart-alert-information').addClass('wp-cart-alert-error')
                }
                $(this).addClass('wp-cart-alert-move')
                $('#wp-cart-alerts').append(this)
                setTimeout((x) => {
                    $(x).remove()
                }, 2000, this);
            })
        });
      });
  });

