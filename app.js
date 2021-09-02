const express = require('express');
const fs = require('fs');
const { Agent } = require('http');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
var cookieParser = require('cookie-parser');
const Pusher = require("pusher");
const csurf = require('csurf');

const app = express();

const server = require("http").createServer(app)
const io = require('socket.io')(server)
const cors = require("cors")

//hidden passwords
const {JWT_SECRET} = require('./keys.js');
const {dbURI} = require('./keys.js')

const Group = require('./models/group.js');
const User = require('./models/user.js');
const Message = require('./models/message.js')
const bodyParser = require('body-parser');


app.use(bodyParser.json());
//register view engine
app.set('view engine', 'ejs');
app.set('views', 'public/views');

//CSRF attack
const csrfMiddleware = csurf({
    cookie: true
  });
var parseForm = bodyParser.urlencoded({extended: false})

mongoose.connect(dbURI, {useNewUrlParser:true, useUnifiedTopology:true})
//listen for requests
const db = mongoose.connection;
db.on('error', console.error.bind(console, "Connection Error: "));
db.once('open', ()=> {
    server.listen(3000)
    const msgCollection = db.collection('messages');
    const msgChangeStream = msgCollection.watch();

    msgChangeStream.on('change', (change) => {
        if(change.operationType === 'insert') {
            const msg = change.fullDocument;
            pusher.trigger(
                'channel',
                'message',
                {
                    user_name : msg.user_name,
                    text : msg.text
                }
            );
        }
        else{
            console.log("SOMETHING WENT WRIONG")
        }
    })
})

app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

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

app.get('/clear', (req, res)=>{
    res.clearCookie('token')
    res.send("cleared")
})

app.get('/', csrfMiddleware, async (req, res) => {
    if(req.cookies.token == null){
        res.redirect('/login')
    }
    else{
        try{
            const user_jwt = jwt.verify(req.cookies.token, JWT_SECRET)
            var group_names = []
            const user = await User.findById(user_jwt.id).lean()
                for (var i=0; i<user.groups_id.length;i++){
                var group = await Group.findById(user.groups_id[i]).lean()
                group_names.push(group.name)
                }
            res.render('index', {username: user.username, groups: group_names, csrfToken: req.csrfToken()})
        }
        catch(error){
            res.json({status: error, error: "bad"})
        }
    }
})

app.post('/chat', (req,res)=>{
    const user_jwt = jwt.verify(req.cookies.token, JWT_SECRET)
    const message = new Message({
        user_id : user_jwt.id,
        user_name : user_jwt.username,
        text : req.body.message,
        group_id: "608dedf13f9dc74c389fb78f"
    })
    message.save()
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
})

app.get('/login', (req, res) => {
    res.render('userlogin', {nonexist: ""});
})

app.post('/login', async (req, res) => {
    const {username, password} = req.body;
    console.log(username, password);
    const user = await User.findOne({ username }).lean()
    if(!user){
        return res.render('userlogin', {nonexist: "Username or Password does not exist"});
    }
    if(await bcrypt.compare(password, user.password)){
        const token = jwt.sign({
            id: user._id, 
            username: user.username
        }, JWT_SECRET)
        res.cookie('token', token, {httpOnly:true, secure: true, sameSite: true})
        res.redirect('/')
    }
    else{
        return res.json({status: 'error', error: 'Invalid username/password'})
    }
})

app.post('/change-password', (req, res) => {
    const {token} = req.body 
    const user = jwt.verify(token, JWT_SECRET)
})

app.post("/entry", parseForm, csrfMiddleware, (req,res)=>{
    res.json({message: "you are under attack"})
})

//404 page
app.use((req, res) => {
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