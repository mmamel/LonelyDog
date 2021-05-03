(function() {
    console.log("autonomous function")
    fetch("/test")
    .then(data  =>  {
        console.log("1234567898")
    return  data.json();
    })
.then(json  =>  {
json.map(data  =>  {
let  li  =  document.createElement("li");
let messages = document.getElementById("messages")
let  span  =  document.createElement("span");
messages.appendChild(li).append(data.message);

    messages
    .appendChild(span)
    .append("by me")

    console.log("this is chat working")
    // .append("by "  +  data.sender  +  ": "  +  formatTimeAgo(data.createdAt));
});
});
})();