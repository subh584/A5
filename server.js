/*********************************************************************************
* WEB700 – Assignment 05
* I declare that this assignment is my own work in accordance with Seneca Academic Policy.
* No part of this assignment has been copied manually or electronically from any other source
* (including web sites) or distributed to other students.
*
* Name: Subhankar Dey   Student ID: sdey10 (129044228)   Date: 27th July 2023
* Github Link: https://github.com/subh584/A5/blob/master/server.js
* Online (Cyclic) Link: https://smiling-beanie-bear.cyclic.app/   [Posted this after stopping Assignment 4 run as only one free run is allowed in Cyclic]
*
********************************************************************************/ 


var express = require("express");
var path = require('path');
var collegeData = require('./modules/collegeData');

const app = express();
const bodyParser = require('body-parser');
const HTTP_PORT = 8080;


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
const exphbs = require('express-handlebars');

app.engine('.hbs', exphbs.engine({ extname: '.hbs',
    helpers: {
        navLink: function(url, options){
            return '<li' +
            ((url == app.locals.activeRoute) ? ' class="nav-item active" ' : ' class="nav-item" ') +
            '><a class="nav-link" href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
            throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) {
            return options.inverse(this);
            } else {
            return options.fn(this);
            }
        }
           
    }
}));
app.set('view engine', '.hbs');

app.use(function(req,res,next){
    let route = req.path.substring(1);
    app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
    next();
   });


// call this function after the http server starts listening for requests
function onHttpStart() {
  console.log("Express http server listening on: " + HTTP_PORT);
}

app.use(express.static('public'));

// setup a 'route' to listen on the default url path (http://localhost)
app.get('/', (req, res) => {
    res.render('home'); // Render the "home" view using handlebars template
  });
  

app.get("/about", (req, res) => {
    res.render('about');
});

app.get("/htmlDemo", (req, res) => {
    res.render('htmlDemo');
});

app.get("/addStudent", (req, res) => {
    res.render('addStudent');
});

app.post("/students/add", (req, res) => {
    collegeData.addStudent(req.body).then(
        res.redirect('/students')
    ).catch(function(reason){
        console.log(reason);
});
});

app.post("/student/update", (req, res) => {
    collegeData.updateStudent(req.body).then(
        res.redirect('/students')
    ).catch(function(reason){
        console.log(reason);
    });
   });

app.get("/students", function(req,res){
    collegeData.getAllStudents().then( (data) => {
        res.render("students",
                    {students: data});
    }).catch((reason)=>{
        res.send(reason);
    })
});

app.get("/tas", function(req,res){
    collegeData.getTAs().then( (data) => {
        res.send(data);
    }).catch((reason)=>{
        res.send(reason);
    })
});

app.get("/courses", function(req,res){
    collegeData.getCourses().then( (data) => {
        res.render("courses",
        {courses: data});
    }).catch((reason)=>{
        res.send(reason);
    })
});

app.get("/course/:id", (req, res) => {
    collegeData.getCourseById(req.params.id).then(
    function (data) {   
        res.render("course", {course: data});

      }
    ).catch(function(reason){
        console.log(reason);
});
});

app.get("/student/:num", (req, res) => {
    collegeData.getStudentByNum(req.params.num).then(

        
    function (studentData) {  
        collegeData.getCourses().then(
            function (coursesData) {
                res.render("student",
                        {student: studentData,
                        courses: coursesData});
    
              }
            ).catch(function(reason){
                console.log(reason);
        });             
      }
    ).catch(function(reason){
        console.log(reason);
});
});

app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname,"/views/pnf.html"));
  });


collegeData
  .initialize()
  .then(() => {
    app.listen(HTTP_PORT, () => {
      console.log("Server listening on port: " + HTTP_PORT);
    });
  })
  .catch((err) => {
    console.error("Error initializing data:", err);
  });
