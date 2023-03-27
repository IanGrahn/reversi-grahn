/********************************* */
/* set up the static file server*/ 
let static = require('node-static');

/* set up http server */
let http = require('http');

/* assume we running heroku */
let port = process.env.PORT;
let directory = __dirname + '/public';

/* if not on heroku, adjust port + directory */
if ((typeof port == 'undefined') || ( port === null)){
    port = 8080;
    directory = './public';
}

/* set up static file web server to deliver files*/
let file = new static.Server(directory);

let app = http.createServer(
    function(request,response){
        request.addListener('end',
            function(){
                file.serve(request,response);''
            }
        ).resume();
    }
).listen(port);

console.log('The server is running');


/********************************* */
/* Set up the web socket server */

const { Server } = require("socket.io");
const io = new Server(app);

io.on('connection', (socket) => {

    /* Output a log message on the server and send it to the clients */
    function serverLog(...messages){
        io.emit('log',['**** Message from the server:\n']);
        messages.forEach((item) => {
            io.emit('log',['****\t'+item]);
            console.log(item);

        });
    }

    serverLog('a page connected to the server: '+socket.id);


    socket.on('disconnect', () => {
        serverLog('a page disconnected from the server: '+socket.id);
    });


    /** joinroom command handler */

    socket.on('join_room', (payload) => {
        serverLog('Server received a command','\'join_room\'',JSON.stringify(payload));
        if ((typeof payload == 'undefined') || (payload === null)){
            response = {};
            response.result = 'fail';
            response.message = 'client did not send a payload';
            socket.emit('join_room_response',response);
            serverLog('join_room command failed', JSON.stringify(response));
            return;
        }
        let room = payload.room;
        let username = payload.username;
        if ((typeof room == 'undefined') || (room === null)){
            response = {};
            response.result = 'fail';
            response.message = 'client did not send a valid room to join';
            socket.emit('join_room_response',response);
            serverLog('join_room command failed', JSON.stringify(response));
            return;
        }
        if ((typeof username == 'undefined') || (username === null)){
            response = {};
            response.result = 'fail';
            response.message = 'client did not send a valid username to join the chat room';
            socket.emit('join_room_response',response);
            serverLog('join_room command failed', JSON.stringify(response));
            return;
        }

        /* handle the command */
        socket.join(room);

        /* ensure that the client was put in the room */
        io.in(room).fetchSockets().then((sockets)=>{
            serverLog('There are '+sockets.length+' clients in the room, '+room);
            if ((typeof sockets == 'undefined') || (sockets === null) || !sockets.includes(socket)){
                response = {};
                response.result = 'fail';
                response.message = 'Server internal error joining chat room';
            socket.emit('join_room_response',response);
            serverLog('join_room command failed', JSON.stringify(response));
            }
            else{
                response = {};
                response.result = 'success';
                response.room = room;
                response.username = username;
                response.count = sockets.length;
                /* tell all that a new user joined reversi game */
                io.of('/').to(room).emit('join_room_response',response);
                serverLog('join_room command succeeded', JSON.stringify(response));
            }
        });
    });
    








/** send_chat_message command handler */

    socket.on('send_chat_message', (payload) => {
        serverLog('Server received a command','\'send_chat_message\'',JSON.stringify(payload));
        if ((typeof payload == 'undefined') || (payload === null)){
            response = {};
            response.result = 'fail';
            response.message = 'client did not send a payload';
            socket.emit('send_chat_message_response',response);
            serverLog('send_chat_message command failed', JSON.stringify(response));
            return;
        }
        let room = payload.room;
        let username = payload.username;
        let message = payload.message;
        if ((typeof room == 'undefined') || (room === null)){
            response = {};
            response.result = 'fail';
            response.message = 'client did not send a valid room to message';
            socket.emit('send_chat_message_response',response);
            serverLog('send_chat_message command failed', JSON.stringify(response));
            return;
        }
        if ((typeof username == 'undefined') || (username === null)){
            response = {};
            response.result = 'fail';
            response.message = 'client did not send a valid username as a message source';
            socket.emit('send_chat_message_response',response);
            serverLog('send_chat_message command failed', JSON.stringify(response));
            return;
        }

        if ((typeof message == 'undefined') || (username === null)){
            response = {};
            response.result = 'fail';
            response.message = 'client did not send a valid message';
            socket.emit('send_chat_message_response',response);
            serverLog('send_chat_message command failed', JSON.stringify(response));
            return;    
        }
        
        let response = {};
        response.result = 'success';
        response.username = username;
        response.room = room;
        response.message = message;
        /* tell everyone in room what message is */
        io.of('/').to(room).emit('send_chat_message_response',response);
        serverLog('send_chat_message command succeeded', JSON.stringify(response));
    });
});





