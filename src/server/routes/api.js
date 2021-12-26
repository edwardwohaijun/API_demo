const path = require('path');
const fs = require('fs');
const express = require('express');
const config = require('../config/index')
const multer  = require('multer')
const hash = require('../utils/hash');


const jwt = require('jsonwebtoken');

const mongoose = require('mongoose');
const mongoSchema = require('../models/index');
const { site, project, CRA, user } = mongoSchema;
const router = express.Router();
const jwtSecret = 'shhhh, keep your voice down'; // todo: 设置 expire
const asyncWrapper = require('./utils/asyncWrapper');

// todo: how to handle error?
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, config.APP_UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    // const fileId = mongoose.Types.ObjectId().toString();
    // req.fileId = fileId; // after uploading, fileName is the mongoDB id, used to save in doc.
    cb(null, mongoose.Types.ObjectId().toString());
  }
});
const upload = multer({ storage });

const tokenChecker = (req, res, next) => {
  console.log(' !req.headers.Authorization', req.headers)
  const auth = req.headers.authorization;
  if (!auth) {
    console.log('header has no authorization')
    res.status(403).send('unauthorized')
    return
  }
  const token = auth.substring(7)
  if (token) {
    jwt.verify(token, jwtSecret, function(err, decoded) {
      if (err) {
        return res.status(401).json({"error": true, "message": 'Unauthorized access.' });
      }
      req.decodedToken = decoded;
      next();
    });
  } else {
    return res.status(403).send({
      "error": true,
      "message": 'No token provided.'
    });
  }
};

const entries = [
  {label: 'Sites', id: 'sites', url: 'sites', accessibleRole: [0, 1, 2, 3]},
  {label: 'Projects', id: 'projects', url: 'projects', accessibleRole: [0, 1, 2, 3]},
  {label: 'CRAs', id: 'CRAs', url: 'CRAs', accessibleRole: [0, 1, 3]},
  {label: 'Query', id: 'query', url: 'query', accessibleRole: [0, 1, 2, 3]},
  {label: 'Administration', id: 'administration', url: 'administration', accessibleRole: [0]}
];



// get user list
router.get('/users', asyncWrapper(async (req, res, next) => {
  // const {siteId, field, attachmentId} = req.body;
  const userList = await user.aggregate([
    {
      $project: {
        name: 1, dob: 1, address: 1, description: 1,
        followingLength: { $size: '$following'},
        followersLength: { $size: '$followers'},
      },
    }
  ]).limit(100);  // find().limit(100);
  res.status(200).send(userList);

}))

router.get('/users', (req, res, next) => {
  console.log('server error: ')
  res.status(500)
})

// create new user
router.post('/user', asyncWrapper(async (req, res, next) => {
  let newUser = new user(req.body);
  let savedUser = await newUser.save();
  res.status(200).send(savedUser)

}))

router.post('/user', (req, res, next) => {
  console.log('server error: ')
  res.status(500)
})


// update user profile
router.put('/user', asyncWrapper(async (req, res, next) => {
  // req.params.id will be populated.

}))

// delete a user
// todo: check all documents with this :id in following, or in followers
// todo: 是否放在req.body中好一些呢?
router.delete('/user/:id', asyncWrapper(async(req, res, next) => {
  let userId = mongoose.Types.ObjectId(req.params.id);
  const deletionResult = await user.deleteOne({ _id: userId }).exec();
  console.log('deletion res: ', deletionResult);
  res.status(200).send();
})) 

// tricky part is: how to get the name(or full profile info) of each following
router.get('/user/:id/following', (req, res, next) => {
  // db.collection.find( { _id : { $in : [1,2,3,4] } } );
})

// ditto
router.get('/user/:id/follower', (req, res, next) => {
  // db.collection.find( { _id : { $in : [1,2,3,4] } } );
})

// add new following to current user
router.put('/user/:id/following/:followingId', (req, res, next) => {

})

// delete a following to current user
router.delete('/user/:id/following/:followingId', (req, res, next) => {

})

// add new follower
router.put('/user/:id/follower/:followerId', (req, res, next) => {

})

// delete follower
router.delete('/user/:id/follower/:followerId', (req, res, next) => {

})


module.exports = router;
