const name = "yoshi";

console.log(name);

const greet = (name) => {
    console.log(`hello, ${name} `);
}

greet('mario');

const people = ['yoshi', 'ryu', 'mario'];

module.exports = {
    people: people 
    //or if they have the same name you can do just people
    //ifyou want to import the module export, you can do const { people } = require('./people');
}

const fs = require('fs');

//this is an ansync task so the err, data is a callback that fires when done
// fs.readFile('./docs/blog1.txt', (err, data) => {
//     if(err){
//         console.log(err);
//     }
//     console.log(data);
// });

//streams

//.on is event listener that listens for a data event, i.e. buffer of data from the stream
//const readStream = fs.createReadStream('./docs/blogs3.txt');
//readStream.on('data', (chunk) => {

//})

//when you have a package.josn you can just call npm install to get all the dependencies listed