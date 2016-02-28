var express = require('express');
var app = express();
var uuid = require('node-uuid');
var bodyParser = require('body-parser');
var port = process.env.PORT || 8080;

app.use(bodyParser.json());

const secret = 'THISISTHEPASSWORD';

var state = {};

var resetState = function() {
  state = {
    teams: 4,
    lastTeam: 1,
    users: {},
    leaderboard : {
      1 : 0,
      2 : 0,
      3 : 0,
      4 : 0,
    },
    game_id: uuid.v4(),
    game_type: 'hockey'
  };
};

app.post('/reset/' + secret, function(req, res) {

  resetState();

  var allowedTypes = [
    'hockey', 'basketball'
  ];

  if (req.body.game_type && allowedTypes.indexOf(req.body.game_type) > -1) {
    state.game_type = req.body.game_type;
  }

  if (req.body.teams && typeof req.body.teams === 'number') {
    state.teams = req.body.teams;
  }

  res.status(201).json(state);
});

app.post('/register', function(req, res) {

  res.status(201).json({
    "game_id": state.game_id,
    "team": (state.lastTeam++ % (state.teams))+1,
    "user_id": uuid.v4()
  });
});

app.get('/leaderboard', function(req, res) {

  res.status(201).json(state.leaderboard);
});

app.post('/points', function(req, res) {

  if (typeof state.leaderboard[req.body.team] === 'undefined') {
    res.status(404).json({error: "no team"});
    return;
  }

  if (typeof req.body.points !== "number") {
    res.status(404).json({error: "invalid points"});
    return;
  }

  state.leaderboard[req.body.team] += req.body.points;

  res.status(201).json(1);
});

resetState();

app.listen( port, function() {
  console.log('listening on port: ' + port);
  console.log(state);
});
