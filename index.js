var express = require('express');
var app = express();
var uuid = require('node-uuid');
var bodyParser = require('body-parser');
var port = process.env.PORT || 8080;
var cors = require('cors');

app.use(cors());
app.use(bodyParser.json());

const secret = 'THISISTHEPASSWORD';

var state = {};

var resetState = function() {
  state = {
    start_in: 90,
    duration: 45,
    progress: 0,
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
    game_type: 'breakaway'
  };
};

app.post('/reset/' + secret, function(req, res) {

  resetState();

  var allowedTypes = [
    'solarsprint', 'breakaway'
  ];

  if (req.body.game_type && allowedTypes.indexOf(req.body.game_type) > -1) {
    state.game_type = req.body.game_type;
  }

  if (req.body.teams && typeof req.body.teams === 'number') {
    state.teams = req.body.teams;
  }

  if (req.body.start_in && typeof req.body.start_in === 'number') {
    state.start_in = req.body.start_in;
  }

  if (req.body.duration && typeof req.body.duration === 'number') {
    state.duration = req.body.duration;
  }

  res.status(201).json(state);
});

app.post('/register', function(req, res) {

  if (state.progress >= state.duration) {
    res.status(400).json({error: "game has ended"});
    return;
  }

  res.status(201).json({
    "game_type": state.game_type,
    "game_id": state.game_id,
    "team": (state.lastTeam++ % (state.teams))+1,
    "user_id": uuid.v4(),
    "start_in": state.start_in,
    "duration": state.duration,
    "progress": state.progress
  });
});

app.get('/leaderboard', function(req, res) {

  res.status(201).json(state.leaderboard);
});

app.post('/points', function(req, res) {

  if (state.start_in > 0) {
    res.status(400).json({error: "game hasn't started"});
    return;
  }

  if (state.progress >= state.duration) {
    res.status(400).json({error: "game has ended"});
    return;
  }

  if (typeof state.leaderboard[req.body.team] === 'undefined') {
    res.status(404).json({error: "no team"});
    return;
  }

  if (typeof req.body.points !== "number") {
    res.status(409).json({error: "invalid points"});
    return;
  }

  state.leaderboard[req.body.team] += req.body.points;

  res.status(201).json(1);
});

resetState();

// starting in interval
setInterval(function() {
  if (state.start_in <= 0) {
    return;
  }
  // console.log('start_in: '+ state.start_in);

  state.start_in--;
}, 1000)

setInterval(function() {
  if (state.start_in > 0) {
    return;
  }

  if (state.progress >= state.duration) {
    return;
  }
  // console.log('progress: '+ state.progress);

  state.progress++;
}, 1000)

app.listen( port, function() {
  console.log('listening on port: ' + port);
  console.log(state);
});
