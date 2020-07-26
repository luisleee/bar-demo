var socket = io();

function createMessage(name, msg, time) {
    var div = document.createElement("div");
    div.className = "msg";
    var user = document.createElement("p");
    var userText = document.createTextNode(name);
    user.appendChild(userText);
    div.appendChild(user);

    var message = document.createElement("blockquote");
    var messageText = document.createTextNode(msg);
    message.appendChild(messageText);
    div.appendChild(message);

    var t = document.createElement("p");
    var tText = document.createTextNode(time);
    t.appendChild(tText);
    div.appendChild(t);
    return div;
}
socket.on("message", function (name, msg, time) {
    if (name !== "<%= username %>") {
        var msgs = document.getElementById("messages");
        var newMessage = createMessage(name, msg, time);
        msgs.insertBefore(newMessage, msgs.firstChild);
        console.log(msg);
    }
});
