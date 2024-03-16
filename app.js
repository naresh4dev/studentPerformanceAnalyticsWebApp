const express = require('express');
const ejs = require('ejs');
const corsOrigin = require('cors');
const bodyParser = require('body-parser');
const { loginQuery, signUpQuery } = require("./utils");
const app = express();


const corsOptions = {
    origin: "*",
    credentials: true, 
    optionSuccessStatus: 200
}

app.use(bodyParser.urlencoded({extended : false}));
app.use(express.static('public'));
app.set('view engine', 'ejs')
app.use(corsOrigin(corsOptions));


app.get('/',(req,res)=>{
    res.render('index');
});

app.get('/login',(req,res)=>{
    res.render('login');
});

app.post('login' ,async (req,res)=>{
    try {
        const {email,password} = req.body;
        const result = await loginQuery(email,password);
        if(result.auth) {
            res.redirect('/dashboard');
        } else {
            res.status(401).json({res:true,auth:false});
        }
    } catch(err) {
        console.error(err)
        return res.status(501).json({msg:"Something went wrong!"});
    }   
});

app.get("/signup",(req,res)=> {
    res.render("signup");
});

app.post('/signup',async (req,res)=>{
    try {
        const {email,password} = req.body;
        const userData = {
            fname : req.body.fname,
            lname : req.body.lname,
            phone : req.body.phone
        }
        const result = await signUpQuery(email,password,userData);
        if(result.auth) {
            res.redirect('/home');
        } else {
            res.status(401).json({res:true,auth : false, msg:result.msg});
        }
    } catch(err) {
        return res.status(501).json({res:false,msg:"Something went wrong!"});
    } 
});



app.get('/dashboard',(req,res)=>{
    res.send("Dashboard");
});