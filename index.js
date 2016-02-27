var express = require('express');
var app = express();
var uuid = require('node-uuid');

const password = 'THISISTHEPASSWORD';

var error = {"error" : "no game in progress"};

var state = {};

var resetState = function() {
  state = {
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

app.post('/reset/' + password, function(req, res) {

  resetState();

  var types = ['hockey', 'basketball'];

  if (req.body.game_type && types.indexOf(req.body.game_type) > -1) {
    state.game_type = req.body.game_type;
  }
  res.send('reset', 200);
});

app.post('/register', function(req, res) {

  if (state === null) {
    res.send(error, 400);
    return;
  }

  res.send({
    "game_id": state.game_id,
    "team": state.lastTeam++ % 4,
    "user_id": uuid.v4()
  }, 201);

});

app.get('/leaderboard', function(req, res) {

  if (state === null) {
    res.send(error, 400);
    return;
  }

  res.send(state.leaderboard, 201);
});

resetState();
app.listen( 5477 );
