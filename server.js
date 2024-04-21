'This is the server.js file that will create a web server and listen for requests from the client. It will also handle the requests and send back the appropriate response.'

var HTTP_PORT = process.env.PORT || 8080; //http://localhost:8080/
var express = require("express");
var app = express();
const collegeData = require('./modules/collegeData');

//Set up the server to use the "public" and "views" directory to serve static files:
app.use(express.static('public'));
app.use(express.static('views'));

//Add body parser to the server:
app.use(express.urlencoded({ extended: true }));

//Initialize the data:
collegeData.initialize()
    .then(function(dataCollection) {
        //http://localhost:8080/students will return all students
        //http://localhost:8080/students?course=2 will return students by course:
        app.get('/students', (req, res) => {
            const course = req.query.course;
            if(course){
                collegeData.getStudentsByCourse(dataCollection, course)
                .then((students) => {
                    res.json(students);
                })
                .catch((err) => {
                    res.send(err);
                });
            } else {
                collegeData.getAllStudents(dataCollection)
                .then((students) => {
                    res.json(students);
                })
                .catch((err) => {
                    res.send(err);
                });
            }
        });

        //http://localhost:8080/tas will return all students is also TA:
        app.get('/tas', (req, res) => {
            collegeData.getTAs(dataCollection)
            .then((tas) => {
                res.json(tas);
            })
            .catch((err) => {
                res.send(err);
            });
        });

        //http://localhost:8080/courses will return all courses:
        app.get('/courses', (req, res) => {
            collegeData.getCourses(dataCollection)
            .then((courses) => {
                res.json(courses);
            })
            .catch((err) => {
                res.send(err);
            });
        });

        //http://localhost:8080/student/1 will return student with id 1:
        app.get('/student/:num', (req, res) => {
            const num = req.params.num;
            collegeData.getStudentByNum(dataCollection, num)
            .then((student) => {
                res.json(student);
            })
            .catch((err) => {
                res.send(err);
            });
        });

        //http://localhost:8080/ will return home.html in "views" directory:
        app.get('/', (req, res) => {
            res.sendFile(__dirname + '/views/home.html');
        });

        //http://localhost:8080/about will return about.html in "views" directory:
        app.get('/about', (req, res) => {
            res.sendFile(__dirname + '/views/about.html');
        });

        //http://localhost:8080/htmlDemo will return htmlDemo.html in "views" directory:
        app.get('/htmlDemo', (req, res) => {
            res.sendFile(__dirname + '/views/htmlDemo.html');
        });

        //http://localhost:8080/students/add will return addStudent.html in "views" directory:
        app.get('/students/add', (req, res) => {
            res.sendFile(__dirname + '/views/addStudent.html');
        });
        
        // POST route to handle adding a new student
        app.post('/students/add', (req, res) => {
            const newStudentData = req.body;
            collegeData.addStudent(newStudentData, dataCollection)
                .then(() => {
                    res.redirect('/students'); // Redirect to the students route after successfully adding the student
                })
                .catch((err) => {
                    res.status(500).send(err); // Handle errors if adding the student fails
                });
        });

        //If the user enters a route that is not matched with anything, return the custom message "Page Not Found":
        app.use((req, res) => {
            res.status(404).send('Page Not Found');
        });

        //Start the server:
        app.listen(HTTP_PORT, () => {
            console.log(`Listening on port ${HTTP_PORT}`);
        });
    })
    

    
    //If the data cannot be initialized, log the error:
    .catch(function(error) {
        console.error(`Failed to initialize data ${error}`);
    });
