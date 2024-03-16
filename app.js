const express = require('express');
const ejs = require('ejs');
const corsOrigin = require('cors');
const bodyParser = require('body-parser');
const { default: axios } = require('axios');
const { loginQuery, signUpQuery,addStudent, getTeacherMappedStudent,getOneStudent } = require("./utils");
const {auth} = require('./connections/firebase');
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

app.get('/addStudent',(req,res)=>{
    res.render("addStudent");
});

app.post('/addStudent',async(req,res)=>{
    try {
        const teacherId = auth.currentUser.uid;
        const studentDetails = req.body;
        const result = await  addStudent(teacherId, studentDetails);
        if(!result) {
          throw new Error("Unable to add Student") 
        } 
        res.redirect('/dashboard');
    } catch (e) {
        console.log('Error',e);
        res.status(500).send('Server error : '+e)
    }
});

app.get('/predict/:studentID',async(req,res) =>{
    try {
        const studentDetails = await getOneStudent(req.params.studentID);
        console.log(studentDetails);
        const config = {
            headers : {
                "Content-Type" : "application/x-www-form-urlencoded"
            }
        }
        const result = await axios.post("http://127.0.0.1:8000/predict", req.body, config);
        if(result.status == 200) {
            res.render('predictStudent', {"studentDetails" : studentDetails, "success" : result.data.success});
        }
    } catch (e) {
        console.error("Error : ", e);
    }
});


app.get('/dashboard',async (req,res)=>{
    try {
        const  userID = auth.currentUser.uid;
        const  studentsList = await getTeacherMappedStudent(userID);
        if (studentsList) {
            res.render('dashboard', {"studentsList":studentsList, teacherDetail : auth.currentUser});    
        } else {
             res.render('dashboard',{"studentList":[], "teacherDetail": auth.currentUser});
        }  
    } catch (e) {
        console.error("Error in dashboard: ",e);
        res.status(500).send("Internal Server Error");
    }
});

app.listen(3001, (err)=>{
    if(!err) {
        console.log("Server Intiated at port 3000.");
    } else {
        console.error("Error in intiating the server");
    }
})