//Pusher
Pusher.logToConsole = true;

var pusher = new Pusher('669a5ab13f536909a0ab', {
    cluster: 'us3'
});

var channel = pusher.subscribe('channel');
channel.bind('message', function(data) {
    addMessage(data.user_name, data.text)
});












const chatForm = document.getElementById("chat-form");

chatForm.addEventListener('submit', (e) => {
    
    console.log("clicked")
    //get message
    const msg = e.target.elements.message.value;
    const data = {message: msg}
    fetch("http://localhost:3000/chat", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
    .then(res=> res.json())
    .then(data => {
        console.log('Success:', data);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
      e.preventDefault();
      e.target.elements.message.value = ''
    //send message to server
})

function addMessage(name, message){
    let  li  =  document.createElement("li");
    let messages = document.getElementById("messages")
    let  span  =  document.createElement("span");
    messages.appendChild(li).append(message);

    messages
    .appendChild(span)
    .append("by "  +  name);
}

(function() {
    fetch("/test")
    .then(data  =>  {
    return  data.json();
    })
.then(json  =>  {
    
[json].map(data  =>  {
    // console.log(data)
let  li  =  document.createElement("li");
let messages = document.getElementById("messages")
let  span  =  document.createElement("span");
messages.appendChild(li).append(data.message);

    // messages
    // .appendChild(span)
    // .append("by "  +  data.sender  +  ": "  +  formatTimeAgo(data.createdAt));
});
});
})();