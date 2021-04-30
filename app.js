const express = require('express');
const fs = require('fs');
const { Agent } = require('http');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
var cookieParser = require('cookie-parser');

const JWT_SECRET = 'ASD893ADF903#@%@ASDFJdlsjel'
const Group = require('./models/group.js');
const User = require('./models/user.js');
// const bodyParser = require('body-parser');
//admin passwrod
//E1uEV9a0VXHRDDZo

//express app
const app = express();
// app.use(bodyParser.json());
//register view engine
app.set('view engine', 'ejs');
app.set('views', 'public/views');

const dbURI = 'mongodb+srv://dev:E1uEV9a0VXHRDDZo@lonelydog.ibylg.mongodb.net/dog?retryWrites=true&w=majority';
mongoose.connect(dbURI, {useNewUrlParser:true, useUnifiedTopology:true})
    .then((result) => app.listen(3000))
    .catch((err) => console.log(err));
//listen for requests


app.use(express.static(__dirname + '/public'));
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

// app.use((req, res, next) => {
//     console.log('new request made');
//     console.log('host: ', req.hostname);
//     console.log('path: ', req.path);
//     console.log('method: ', req.method);
//     next();
// });

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
app.get('/', (req, res) => {
        if(req.cookies.token == null){
            res.redirect('/login')
        }
        else{
            try{
                const user = jwt.verify(req.cookies.token, JWT_SECRET)
                User.findById(user.id)
                .then((result) => {
                    res.render('index', {username: result.name, groups: result.followed_groups})
                })
                .catch((err) => {
                    console.log(err)
                })
            }
            catch(error){
                res.json({status: error, error: "bad"})
            }
        }
        
        
    // }
    
    // const groups = []
    // res.sendFile('./public/views/index.html', {root: __dirname });
    // res.render('index', {username: 'panda', groups});
})

app.post('/update', (req, res) => {
    console.log(req.body.groupname);
    Group.findOneAndUpdate({_id: "6074eca7e390174af85d2c34"}, {
        $push: {
            list: req.body.groupname
        }
    }, {new:true}).then((result) => {
        res.redirect('/');
    }).catch((err) => {
        console.log(err);
    })
})
app.get('/addgroup', (req, res) => {
    res.render('addgroup');
})
app.get('/register', (req, res) => {
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