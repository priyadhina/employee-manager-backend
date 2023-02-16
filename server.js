require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const utils = require('./utils');

const app = express();
const port = process.env.PORT || 4000;

// static user details
let users = [
  {
    id: 1,
    username: 'admin',
    password: 'admin',
    firstName: 'Admin',
    lastName: 'User',
    role: 'Admin',
  },
  {
    id: 2,
    username: 'user',
    password: 'user',
    firstName: 'Normal',
    lastName: 'User',
    role: 'User',
  },
];

const employeeList = require('./employeeList');
const chartData = {
  2017: 1,
  2018: 1,
};

// enable CORS
app.use(cors());
// parse application/json
app.use(bodyParser.json());
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

//middleware that checks if JWT token exists and verifies it if it does exist.
//In all future routes, this helps to know if the request is authenticated or not.
app.use(function (req, res, next) {
  // check header or url parameters or post parameters for token
  var token = req.headers['authorization'];
  if (!token) return next(); //if no token, continue

  token = token.replace('Bearer ', '');
  jwt.verify(token, process.env.JWT_TOKEN, function (err, user) {
    if (err) {
      return res.status(401).json({
        error: true,
        message: 'Invalid user.',
      });
    } else {
      req.user = user; //set the user to req so other routes can use it
      next();
    }
  });
});

// request handlers
app.get('/', (req, res) => {
  if (!req.user)
    return res
      .status(401)
      .json({ success: false, message: 'Invalid user to access it.' });
  res.send('Welcome to the Node.js Tutorial! - ' + req.user.name);
});

// validate the user credentials
app.post('/users/signin', function (req, res) {
  const user = req.body.username;
  const pwd = req.body.password;

  // return 400 status if username/password is not exist
  if (!user || !pwd) {
    return res.status(400).json({
      error: true,
      message: 'Username or Password required.',
    });
  }

  const userData = users.find((x) => x.username === user && x.password === pwd);
  // return 401 status if the credential is not match.
  if (!userData) {
    return res.status(401).json({
      error: true,
      message: 'Username or Password is Wrong.',
    });
  }

  // generate token
  const token = utils.generateToken(userData);
  // get basic user details
  const userObj = utils.getCleanUser(userData);
  // return the token along with user details
  return res.json({ user: userObj, token });
});

// verify the token and return it if it's valid
app.get('/verifyToken', function (req, res) {
  // check header or url parameters or post parameters for token
  var token = req.body.token || req.query.token;
  if (!token) {
    return res.status(400).json({
      error: true,
      message: 'Token is required.',
    });
  }
  // check token that was passed by decoding token using secret
  jwt.verify(token, process.env.JWT_TOKEN, function (err, user) {
    if (err)
      return res.status(401).json({
        error: true,
        message: 'Invalid token.',
      });

    const userData = users.find((x) => x.id === user.id);
    // return 401 status if the id does not match.
    if (!userData) {
      return res.status(401).json({
        error: true,
        message: 'Invalid user.',
      });
    }
    // get basic user details
    var userObj = utils.getCleanUser(userData);
    return res.json({ user: userObj, token });
  });
});

// return employee list
app.get('/employees', function (req, res) {
  return res.json({ employeeList });
});

//fetch chart Data
app.get('/fetchChartData', function (req, res) {
  return res.json({ chartData });
});

//add new employee
app.post('/addEmployee', function (req, res) {
  const values = req.body.values;
  employeeList.push(values);
  const year = new Date(values.joinDate).getFullYear();
  chartData[year] = chartData[year] ? chartData[year] + 1 : 1;
  return res.json({ employeeList });
});

app.post('/editEmployee', function (req, res) {
  const values = req.body.values;
  const index = req.body.index;

  employeeList[index] = values;
  return res.json({ employeeList });
});

app.get('/deleteEmployee', function (req, res) {
  var index = req.query.index;
  var data = req.query.data;
  employeeList.splice(index, 1);
  const year = new Date(data).getFullYear();
  chartData[year] = chartData[year] ? chartData[year] - 1 : 0;
  return res.json({ employeeList });
});

app.listen(port, () => {
  console.log('Server started on: ' + port);
});
