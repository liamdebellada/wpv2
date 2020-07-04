window.addEventListener("load", function(){
    $.ajax({
        type: "POST",
        url: "/getCart",
        data: {}
    }).done(data => {
        console.log(data)
    });
  });