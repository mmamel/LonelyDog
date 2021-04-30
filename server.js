const http = require('http');
const fs = require('fs');
const _ = require('lodash');
const server = http.createServer( (req, res) => {
//lodash

    const num = _.random(0, 20);
    console.log(num);
    
    res.setHeader('Content-Type', 'text/plain');

    res.write('hello, ninjas');
    res.end();

});

server.listen(3000, 'localhost', () => {
    console.log('listening for requests on port 3000');
});