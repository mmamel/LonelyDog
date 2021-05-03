//http branch
//new addition
const express = require('express');
const fs = require('fs');
const { Agent } = require('http');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
var cookieParser = require('cookie-parser');
const Pusher = require("pusher");

const app = express();

const server = require("http").createServer(app)
const io = require('socket.io')(server)
const cors = require("cors")

const JWT_SECRET = 'ASD893ADF903#@%@ASDFJdlsjel'
const Group = require('./models/group.js');
const User = require('./models/user.js');
const Message = require('./models/message.js')
const bodyParser = require('body-parser');
//admin passwrod
//E1uEV9a0VXHRDDZo

app.use(bodyParser.json());
//register view engine
app.set('view engine', 'ejs');
app.set('views', 'public/views');

const dbURI = 'mongodb+srv://dev:E1uEV9a0VXHRDDZo@lonelydog.ibylg.mongodb.net/dog?retryWrites=true&w=majority';
mongoose.connect(dbURI, {useNewUrlParser:true, useUnifiedTopology:true})
    .then((result) => server.listen(3000))
    .catch((err) => console.log(err));
//listen for requests


app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(cors());
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

const pusher = new Pusher({
    appId: "1197719",
    key: "669a5ab13f536909a0ab",
    secret: "9bec39289ddb44136391",
    cluster: "us3",
    useTLS: true
  });
  
// app.use((req, res, next) => {
//     console.log('new request made');
//     console.log('host: ', req.hostname);
//     console.log('path: ', req.path);
//     console.log('method: ', req.method);
//     next();
// });

io.on("connection", (socket) => {
    // socket.on("group_id", (gameId) => {});
    // socket.on("message", (message)=>{});
    console.log("new connection")
    socket.emit('message', 'Welcome');
    socket.broadcast.emit('message', 'A user has joined the chat');
    socket.on('disconnect', ()=>{
        io.emit('message', 'A user has left the chat');
    })

    //listen for chat message
    socket.on('chatMessage', (msg) => {
        io.emit('message', msg)
    })
})

app.get('/add-group', (req, res) => {
    const group = new Group({
        name: "magee wanka",
        list: ["Call of Duty", "Desinty 2"]
        
    });
    group.save()
    .then((result) => {
        res.send(result)
    })
    .catch((err) => {
        console.log(err);
    })
});

// app.get('/single-user', (req, res) => {
//     Group.findById('6074d01bedb27e1f304167b2')
//     .then((result) => {
//         res.send(result);
//     })
//     .catch((err) => {
//         console.log(err);
//     })
// })
app.get('/clear', (req, res)=>{
    res.clearCookie('token')
    res.send("cleared")
})
// app.get('/', async (req, res) => {
//         if(req.cookies.token == null){
//             res.redirect('/login')
//         }
//         else{
//             try{
//                 const user = jwt.verify(req.cookies.token, JWT_SECRET)
//                 console.log(user)
//                 User.findById(user.id)
//                 .then((result) => {
                    
//                     res.render('index', {username: result.username, groups: result.groups_name})
//                 })
//                 .catch((err) => {
//                     console.log(err)
//                 })
//             }
//             catch(error){
//                 res.json({status: error, error: "bad"})
//             }
//         }

// })

//dont know how slow this is using so many await functions
app.get('/', async (req, res) => {
    if(req.cookies.token == null){
        res.redirect('/login')
    }
    else{
        try{
            const user_jwt = jwt.verify(req.cookies.token, JWT_SECRET)
            var group_names = []
            const user = await User.findById(user_jwt.id).lean()
                for (var i=0; i<user.groups_id.length;i++){
                    console.log(user.groups_id[i])
                var group = await Group.findById(user.groups_id[i]).lean()
                group_names.push(group.name)
                }
             
            console.log(group_names)
            // res.setHeader("Content-Type", "application/json");
            // res.statusCode  =  200;
            res.render('index', {username: user.username, groups: group_names})
           
        }
        catch(error){
            res.json({status: error, error: "bad"})
        }
    }

})




app.post('/chat', (req,res)=>{
    const user_jwt = jwt.verify(req.cookies.token, JWT_SECRET)
    pusher.trigger("channel", "message", {
        message: req.body.message,
        user_id: user_jwt._id
      });
      res.redirect('/')
})
app.get('/test',  (req, res)=>{
    res.setHeader("Content-Type", "application/json");
    res.statusCode  =  200;
    res.json({message: ["its working", "this tesst"]})
})
app.post('/join-group', async (req, res) => {
    const user = jwt.verify(req.cookies.token, JWT_SECRET)
    console.log(user.id)
    console.log(req.body.groupname);
    const group = await Group.findOne({"name":req.body.groupname}).lean()
    console.log(group)
    User.findOneAndUpdate({_id: user.id}, {
        $push: {
            groups_id: group._id,
            groups_name: group.name
        }
    }, {new:true}).then((result) => {
        res.redirect('/');
    }).catch((err) => {
        console.log(err);
    })
})
app.post('/create-group', (req, res) => {
    const user = jwt.verify(req.cookies.token, JWT_SECRET)
    console.log(user.id)
    console.log(req.body.groupname);
    var id = ''
    const group = new Group({
        name: req.body.groupname,
        member_id: [user.id]
        });
        //hwo to chain calls
    group.save()
    .then((result) => {
        // res.send(result)
        // res.status(200)
        User.findOneAndUpdate({_id: user.id}, {
            $push: {
                groups_id: result._id,
                groups_name: result.name
            }
        }, {new:true}).then((result) => {
            res.status(200)
            res.redirect('/');
        }).catch((err) => {
            console.log(err);
        })
        
    })
    .catch((err) => {
        if(err.code ===11000){
            res.render('usersignup', {duplicate: "Username is already in use"})
            res.end()
            
        }
        else{
            throw err
        }
    })
    
})
// app.get('/addgroup', (req, res) => {
//     res.render('addgroup');
// })
app.get('/register', (req, res) => {
    res.render('usersignup', {duplicate: ""});
})
app.post('/register', (req, res) => {
    res.render('usersignup', {duplicate: ""});
})
app.post('/signup-user', (req,res)=> {
    const {username, password} = req.body;
    // const hash = hashPassword(password)
    bcrypt.hash(password, 10).then(function(hash) {
        console.log(typeof(hash))
        console.log(hash)
        const user = new User({
            username: username,
            password: hash,
            followed_groups: []
            });
        user.save()
        .then((result) => {
            // res.send(result)
            res.status(200)
            res.redirect('/')
            console.log("I am here")
            
        })
        .catch((err) => {
            if(err.code ===11000){
                res.render('usersignup', {duplicate: "Username is already in use"})
                res.end()
                
            }
            else{
                throw err
            }
        })
    });
    // res.redirect('/')
})
app.get('/login', (req, res) => {
    res.render('userlogin');
})

app.post('/login', async (req, res) => {
    const {username, password} = req.body;
    console.log(username, password);



    const user = await User.findOne({ username }).lean()
    
    
    if(!user){
        return res.json({status: 'error', error: 'Invalid username/password'})
    }
    
    if(await bcrypt.compare(password, user.password)){

        const token = jwt.sign({
            id: user._id, 
            username: user.username
        }, JWT_SECRET)

        res.cookie('token', token)
        res.redirect('/')
    }
    else{
        return res.json({status: 'error', error: 'Invalid username/password'})

    }
    
    // (async () => {
    //     const hash = await hashPassword(password);
    //     // $2b$10$5ysgXZUJi7MkJWhEhFcZTObGe18G1G.0rnXkewEtXq6ebVx1qpjYW
    //     console.log(hash)
    //     // TODO: store hash in a database
    // })();

    

    // res.redirect('/')
})

app.post('/change-password', (req, res) => {
    const {token} = req.body 
    const user = jwt.verify(token, JWT_SECRET)
})

//for redirects use res.redirect
// app.get('/redirect-me', (req, res) => {

//     res.redirect('/');

// })
//404 page
app.use((req, res) => {
    // res.status(404).sendFile('./public/views/404.html', {root: __dirname});
    res.status(404).render('404')
})


const hashPassword = async (password, saltRounds = 10) => {
    try {
        // Generate a salt
        const salt = await bcrypt.genSalt(saltRounds);

        // Hash password
        return await bcrypt.hash(password, salt);
    } catch (error) {
        console.log(error);
    }

    // Return null if error
    return null;
};

function getCookie(name) {
    var dc = document.cookie;
    var prefix = name + "=";
    var begin = dc.indexOf("; " + prefix);
    if (begin == -1) {
        begin = dc.indexOf(prefix);
        if (begin != 0) return null;
    }
    else
    {
        begin += 2;
        var end = document.cookie.indexOf(";", begin);
        if (end == -1) {
        end = dc.length;
        }
    }
    // because unescape has been deprecated, replaced with decodeURI
    //return unescape(dc.substring(begin + prefix.length, end));
    return decodeURI(dc.substring(begin + prefix.length, end));
} 