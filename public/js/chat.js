const socket = io();
const chatForm = document.getElementById("chat-form");
socket.on('message', message => {
    console.log(message);
    addMessage(message);
});

chatForm.addEventListener('submit', (e) => {
    e.preventDefault();

    //get message
    const msg = e.target.elements.message.value;

    //send message to server
    socket.emit('chatMessage', msg);
})

function addMessage(message){
    let  li  =  document.createElement("li");
    let messages = document.getElementById("messages")
    let  span  =  document.createElement("span");
    messages.appendChild(li).append(message);
}

(function() {
    fetch("/test")
    .then(data  =>  {
    return  data.json();
    })
.then(json  =>  {
    console.log(json)
[json].map(data  =>  {
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