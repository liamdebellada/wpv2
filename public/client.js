window.addEventListener("load", function(){
    $.ajax({
        type: "POST",
        url: "/getCart",
        data: {}
    }).done(data => {
        console.log(data)
    });
  });



function removeItem(item) {
    console.log(item.id) //id for specific item to be removed

    $.ajax({
        type: "POST",
        url: "/removeCart",
        data: { id: item.id}
    }).done(data => {
        window.location.href=data
    });
    //reload to update page. Could use Ajax, however it wouldnt work with ejs since we render the page statically.
}