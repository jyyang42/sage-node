var router = require('express').Router();
var ProgressService = require ('../services/progress.js');

var multer  = require('multer');
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads/submissions');
  },
  filename: function (req, file, cb) {

      cb(null, Date.now() + file.originalname.replace(' ', '_'));        
  }
});

var upload = multer({ storage: storage });



var ProgressController = function(app) {

  router.get('/student/:studentID/assignment/:assignmentID', ProgressController.fetchAssignmentProgress);
  router.put('/student/:studentID/assignment/:assignmentID/updateJSON', ProgressController.updateJSON);
  router.post('/student/:studentID/assignment/:assignmentID', upload.single('sb2File'), ProgressController.submitAssignment);
  app.use('/progress', router);
};


ProgressController.fetchAssignmentProgress = (req, res, next) => {
	let {studentID, assignmentID} = req.params;

	ProgressService.fetch({assignmentID,studentID})
	.then((progress)=>res.send(progress))
	.catch((err) => next(err));

};

ProgressController.updateJSON = (req, res, next) => {
	let {studentID, assignmentID} = req.params;
	let {jsonString} = req.body;

	ProgressService.addNewJSON ({studentID, assignmentID, jsonString})
	.then((progress) => res.send(progress))
	.catch((err) => next(err));
};


ProgressController.submitAssignment = (req, res, next) => {

	let properties = {
		assignmentID:req.params.assignmentID,
		studentID: req.params.studentID,
		lastUpdatedsb2FileLocation : req.file.path
	};

	//TODO- add logic for points calculation.

	ProgressService.submitAssignment(properties)
	.then((progress) => res.send(progress))
	.catch((err) => next(err));

};


module.exports = ProgressController;
