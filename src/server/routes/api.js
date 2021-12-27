const express = require('express');
const multer  = require('multer')

const haversine = require('haversine-distance')


const jwt = require('jsonwebtoken');

const mongoose = require('mongoose');
const mongoSchema = require('../models/index');
const { user } = mongoSchema;
const router = express.Router();
const jwtSecret = 'shhhh, keep your voice down'; // todo: 设置 expire
const asyncWrapper = require('./utils/asyncWrapper');

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

// all API need to do some validation before writing into mongoDB


// get user list
router.get('/users', asyncWrapper(async (req, res, next) => {
  // const {siteId, field, attachmentId} = req.body;
  const userList = await user.aggregate([
    {
      $project: {
        name: 1, dob: 1, address: 1, description: 1, geolocation: 1,
        followingLength: { $size: '$following'},
        followersLength: { $size: '$followers'},
      },
    }
  ]).limit(100);
  res.status(200).send(userList);

}))

router.get('/users', (req, res, next) => {
  console.log('server error: ')
  res.status(500)
})

// create new user
router.post('/user', asyncWrapper(async (req, res, next) => {
  console.log('new user creation: ', req.body)
  let newUser = new user(req.body);
  let savedUser = await newUser.save();
  savedUser = savedUser.toObject();
  savedUser.followingLength = 0;
  savedUser.followersLength = 0;
  console.log('saved user after creatoin: ', savedUser)
  res.status(200).send(savedUser)
}))

router.post('/user', (req, res, next) => {
  console.log('server error: ')
  res.status(500)
})



// update user profile
router.put('/user', asyncWrapper(async (req, res, next) => {
  let {_id, name, dob, address, description } = req.body;
  let updatedUser = await user.findByIdAndUpdate(_id, {name, dob, address, description}, {new: true}).lean();
  updatedUser.followingLength = updatedUser.following.length;
  updatedUser.followersLength = updatedUser.followers.length;

  console.log('updated User: ', updatedUser);
  res.status(200).send(updatedUser);
}))

router.put('/user', (req, res, next) => {
  console.log('err updating user');
  res.status(500)
})

// delete a user
// todo: check all documents with this :id in following, or in followers
// todo: 是否放在req.body中好一些呢?
router.delete('/user/:id', asyncWrapper(async(req, res, next) => {
  let userId = mongoose.Types.ObjectId(req.params.id);
  const deletionResult = await user.deleteOne({ _id: userId }).exec();
  console.log('deletion res: ', deletionResult);
  res.status(200).send();
})) 

// get the current user's following info
router.get('/user/:id/following', asyncWrapper(async(req, res, next) => {
  console.log('myid: ', req.params.id)
  let followingList = await user.findById(req.params.id).select('following').exec();
  console.log('following list: ', followingList)
  let followerList = await user.find({'_id': {$in: followingList.following}}).lean().exec()
  followerList.forEach(f => f.isFollowing = true);
  // 还要附上true, 他们是从个人的following array中读取出来的, 肯定是true.
  console.log('follower: ', followerList);
  res.status(200).send(followerList)
}))

// ditto, 暂时不做, 功能类似上例.
router.get('/user/:id/follower', (req, res, next) => {
  // db.collection.find( { _id : { $in : [1,2,3,4] } } );
})

router.post('/check-following', asyncWrapper(async(req, res, next) => {
  // req.body: userId, searchTerm, 返回该searchTerm(对应的用户)的profile, 和是否, 当前userId是following关系.
  let { userId, searchTerm } = req.body;
  let userInfo = await user.findById( userId ).exec();
  // regex is low on performance, so only one record is returned
  let searchTermInfo = await user.findOne({ name: { "$regex": searchTerm, "$options": "i"}}).lean().exec();
  if (searchTermInfo != null) {
    searchTermInfo.isFollowing = false;
    if ( userInfo.following.findIndex(f => f._id.equals(searchTermInfo._id)) != -1 ) {
      searchTermInfo.isFollowing = true;
    }
  }

  console.log('search result: ', searchTermInfo)
  res.status(200).send(searchTermInfo);
}))

// user follow another user
router.post('/user/follow', asyncWrapper(async(req, res, next) => {
  let {userId, followingId} = req.body;
  // todo: check whether user is already following the other user.
  let updatedUser = await user.findByIdAndUpdate(userId, {$push: {'following': mongoose.Types.ObjectId(followingId) }}, {new: true}).lean().exec();
  let followerUser = await user.findByIdAndUpdate(followingId, {$push: {'followers': mongoose.Types.ObjectId(userId) }}, {new: true}).lean().exec();
  followerUser.isFollowing = true;
  console.log('updated user: ', updatedUser, '//', followerUser)
  res.status(200).send(followerUser);
}))

// user unfollow another user
router.post('/user/unfollow', asyncWrapper(async(req, res, next) => {
  let {userId, followingId} = req.body;
  // todo: check whether user is already unfollowing the other user.
  let updatedUser = await user.updateOne({_id: userId}, {$pull: {'following': mongoose.Types.ObjectId(followingId) }}, {new: true}).lean().exec();
  let followerUser = await user.updateOne({_id: followingId}, {$pull: {'followers': mongoose.Types.ObjectId(userId) }}, {new: true}).lean().exec();
  followerUser.isFollowing = false;
  console.log('updated user: ', updatedUser, '//', followerUser)
  res.status(200).send(followerUser);

}))

router.get('/user/:userId/nearby', asyncWrapper(async(req, res, next) => {
  let userInfo = await user.findById(req.params.userId).exec();
  let userGeolocation = userInfo.geolocation;
  console.log('current user geoLocation: ', userGeolocation);
  let {following, followers} = userInfo;
  let friends = following.concat(followers);
  friends = new Set(friends); // there might be duplicate record in friends array(A follows B, B follows A), use Set to de-duplicate
  friends = Array.from(friends);
  console.log('get nearly friends: ', friends);
  // todo: remove myself in friend, in case that I follow myself.
  let friendsLocation = await user.find({'_id': {$in: friends}}).exec()
  // let followerList = await user.find({'_id': {$in: followingList.following}}).lean().exec()
  // let followingList = await user.findById(req.params.id).select('following').exec();
  console.log('friends location: ', friendsLocation);

  let distances = friendsLocation.map(l => {
    return {
      _id: l._id,
      distance: (haversine(userGeolocation, l.geolocation) / 1000).toFixed(),
      name: l.name,
      description: l.description,
      address: l.address,
      dob: l.dob,
    }
  })
  console.log('distances: ', distances)

  res.status(200).send(distances);
}))


module.exports = router;
