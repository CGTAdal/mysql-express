window.onload = function() {
    var messages = [];
    var socket = io.connect('http://localhost:3000');
    
    var sendButton = document.getElementById("send");
    
    var name = document.getElementById("name");
 
    socket.on('message', function (data) {
        var content = document.getElementById("content");
        // console.log(content,data);
        if(content) {
            /*messages.push(data);
            var html = '';
            for(var i=0; i<messages.length; i++) {
                html += '<b>' + (messages[i].device_id ? messages[i].device_id : 'Server') + ': </b>';
                html += messages[i].title + '<br />';
            }
            content.innerHTML = html;*/
            // messages.push(data);
            
            if(data.length > 0 ){
                var html = '';
                for(var i=0; i<data.length; i++) {
                    html += '<b>' + (data[i].device_id ? data[i].device_id : 'Device') + ': </b>';
                    html += data[i].desc + '<br />';
                }
                content.innerHTML = html;
            }
        } else {
            console.log("There is a problem:", data);
        }
    });

    if(sendButton){
        sendButton.onclick = function() {
            var title = document.getElementById("title");
            var url = document.getElementById("url");
            
            // if(name.value == "") {
                // alert("Please type your name!");
            // } else {
                var text = title.value;
                socket.emit('send', { desc: text, device_id: url.value });
                title.value = "";
                url.value = "";
            // }
        };
    }
}