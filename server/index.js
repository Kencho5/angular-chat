const express = require('express');
const session = require('express-session');
const app = express();

app.use(
  express.urlencoded({
    extended: true
  })
)

app.use(express.json());
app.use(session({secret: 'secret'}));

var onlineUsers = [];
var users = [];
app.post('/api/online', (req, res) => {
  username = req.body.username;
  
  if(onlineUsers.includes(username) == false) {
    onlineUsers.push(username);
  }

  if(users.length > 1) {
    users.splice(users.findIndex((obj => obj.username == username)), 1);
    users.push(req.body);
  } else {
    users.push(req.body)
  }

  res.status(200);
});

app.post('/api/offline', (req, res) => {
  onlineUsers.splice(onlineUsers.indexOf(req.body.username), 1);

  users.forEach((element, index) => {
    if(element.username == req.body.username) {
      users.splice(users.indexOf(element), 1);
    }
  });
  res.status(200);
});

app.post('/api/users', (req, res) => {
  res.status(200).send({
    code: 200,
    users: onlineUsers
  });
});

app.post('/api/id', (req, res) => {
  res.status(200).send({
    code: 200,
    id: users[users.findIndex((obj => obj.username == req.body.username))].id
  });
});

app.listen(8080, () => console.log(`Started server at http://localhost:8080!`));
