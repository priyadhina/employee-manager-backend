// generate token using secret from process.env.JWT_TOKEN
var jwt = require('jsonwebtoken');

// { id: 1, username: 'admin', password: 'admin', firstName: 'Admin', lastName: 'User', role: 'Admin' }
// generate token and return it
function generateToken(user) {
  //1. Don't use password and other sensitive fields
  //2. Use the information that are useful in other parts
  if (!user) return null;

  var u = {
    id: user.id,
    name: user.firstName + ' ' + user.lastName,
    username: user.username,
    role: user.role,
  };

  return jwt.sign(u, process.env.JWT_TOKEN, {
    expiresIn: 60 * 60 * 24, // expires in 24 hours
  });
}

// return basic user details
function getCleanUser(user) {
  if (!user) return null;

  return {
    id: user.id,
    name: user.firstName + ' ' + user.lastName,
    username: user.username,
    role: user.role,
  };
}

const generateInitialChartData = () => {
  const currentYear = new Date().getFullYear();
  const employeeCount = 0;
  const chartData = [];
  for (var i = 0; i < 10; i++) {
    chartData.push({ year: currentYear - i, count: 0 });
  }

  return chartData;
};

const initialState = {
  chartData: generateInitialChartData(),
};

module.exports = {
  generateToken,
  getCleanUser,
  initialState,
};
