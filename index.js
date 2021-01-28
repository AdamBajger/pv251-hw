// THIS DOES NOT WORK
// Use the project as a HTML thing.


const express = require('express');
const app = express();
const port = 3000;

app.use(express.static('css'));
app.use('/css', express.static(__dirname + '/css'));

app.use(express.static('js'));
app.use('/js', express.static(__dirname + '/js'));

app.use(express.static('data'));
app.use('/data', express.static(__dirname + '/data'));

app.use(express.static('lib'));
app.use('/lib', express.static(__dirname + '/lib'));

app.get('/', function(req, res) { res.sendFile(__dirname + "/index.html")});

app.listen(port, function (){console.log('Example app listening on port '+port+'!')});

