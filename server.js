const http = require('http'); //loads the library to enable it to act as a server
let port = process.env.PORT || 5000; //specifies the port no to whatever heroku gives or 5000 on local host
app = http.createServer();

/*// Used resources such as CSS, js libraries and plugins, datasets, etc.
app.use(express.static('css'));
app.use('/css', express.static(__dirname + '/css'));

app.use(express.static('js'));
app.use('/js', express.static(__dirname + '/js'));

app.use(express.static('data'));
app.use('/data', express.static(__dirname + '/data'));

app.use(express.static('lib'));
app.use('/lib', express.static(__dirname + '/lib'));*/


// comunication settings
app.get('/', function(req, res) { res.sendFile(__dirname + "/index.html")});


app.listen(port); // attaches this server to the port no.