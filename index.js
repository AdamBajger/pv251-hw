

const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const port = 3000;

// Used resources such as CSS, js libraries and plugins, datasets, etc.
app.use(express.static('css'));
app.use('/css', express.static(__dirname + '/css'));

app.use(express.static('js'));
app.use('/js', express.static(__dirname + '/js'));

app.use(express.static('data'));
app.use('/data', express.static(__dirname + '/data'));

app.use(express.static('lib'));
app.use('/lib', express.static(__dirname + '/lib'));

app.use(bodyParser.urlencoded({ extended: false }));

// comunication settings
app.get('/', function(req, res) { res.sendFile(__dirname + "/index.html")});

app.post('/api/data', function(request, response) {
    var postBody = request.body;
    console.log(postBody);
    console.log(response);
    response.send("OK")
});

app.listen(port, function (){console.log('Example app listening on port '+port+'!')});

