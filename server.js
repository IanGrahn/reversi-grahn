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