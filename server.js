//imports
var express = require('express');
var bodyParser  = require('body-parser');
var apiRouter   = require('./apiRouter').router;
//intanstiate server
var server = express('');
// Body Parser configuration
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());

//configure routes
server.get('/', (req, res) =>{
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send('<h1>Bonjour sur mon super server</h1>');
});

server.use('/api/', apiRouter);

// Launch server
server.listen(8080, () =>{
    console.log('Server en écoute :)');
});