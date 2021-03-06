var router = require('express').Router();
var GameService = require ('../services/game.js');
var ObjectiveService = require ('../services/objective.js');
var multer  = require('multer');
var storage = multer.diskStorage({
  destination (req, file, cb) {cb(null, './uploads/games');},
  filename (req, file, cb) {cb(null, Date.now() + file.originalname.replace(' ', '_'));}
});
var upload = multer({ storage });

var GameController = function(app) {

  router.get('/:gameID', GameController.fetchGame);
  // Post game from Affinity Space every second
  router.get('/link/game/:gameID/objective/:objectiveID', GameController.linkGameWithObjective);
  router.post('/student/:studentID/game/:gameID/objective/:objectiveID', upload.single('file'), GameController.submitAndProcess);
  router.post('/students/:studentID/assignments/:assignmentID/results', upload.single('file'), GameController.searchSubmitAndProcess);
  app.use('/games', router);
};

GameController.fetchGame = (req, res, next) => {
  GameService.fetchGame(req.params.gameID)
    .then((game) => res.send(game))
    .catch((err) => next(err));
};

GameController.linkGameWithObjective = (req, res, next) => {
  let properties = {
    gameID: req.params.gameID, objectiveID: req.params.objectiveID
  };

  GameService.linkObjective(properties).then((progresses) => res.send("Game " + req.params.gameID + " linked with " + req.params.objectiveID))
    .catch ((err) => next (err));
  console.log("Game", req.params.gameID, "linked with ", req.params.objectiveID);
};

GameController.submitAndProcess = (req, res, next) => {
  let properties = {
    gameID: req.params.gameID, studentID: req.params.studentID, jsonString: req.body, objectiveID: req.params.objectiveID
  };
  //console.log("Parsing Game:"+ req.params.gameID + " for student " + req.params.studentID);

  // Load game into in-memory game structure
  var gameObject = GameService.refreshGame(properties)
  GameService.submitSprite(properties,gameObject).then((progresses) => res.send("Game " + req.params.gameID + " uploaded. "))
    .catch ((err) => next (err));

  console.log("Game", req.params.gameID, "uploaded");

};

GameController.searchSubmitAndProcess = (req, res, next) => {

  console.log("Processing Student's submission" + req.params.studentID);
  console.log("Parsing Game:"+ req.body);
  for (val of req.body.children) {
    //console.log(val.objName)
    let properties = {
      gameID: req.params.gameID, lastUpdatedsb2FileLocation: "in database", jsonString: req.body, sprite: val
    };

    //GameService.submitGame(properties);
    //GameService.submitGame(properties).then((game) => res.send(game)).catch((err) => next(err));
  }
  res.send("Game submission complete");
};

module.exports = GameController;
