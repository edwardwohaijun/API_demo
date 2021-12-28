const request = require('../common_test');
const fs = require('fs');

import 'regenerator-runtime/runtime';

let userA_id;
let userB_id;
/*
        name: 1, dob: 1, address: 1, description: 1, geolocation: 1,
        followingLength: { $size: '$following'},
        followersLength: { $size: '$followers'},
*/

// beijing
// lat: 39.9, longitude: 116.3

//Create user_A
describe("POST a new userA request", () => {
  try{
    let userDetails;
    beforeEach(function () {  
        console.log("Input user details!")
        userDetails = {
          name: "user_A", dob: '1990-02-03', address: 'Shanghai', geolocation: {latitude: 31.22222, longitude: 121.45806},
          description: 'I am user_A in Shanghai.'
      }; //new user details to be created
      });
    
    afterEach(function () {
      console.log("User_A is created with ID : ", userA_id)
    });

	  it("Create user data", async () => {
        return request.request.post(`API_demo/api/user`) //post() of supertest
                //.set('Authorization', `Token $  {request.token}`) //Authorization token
                .send(userDetails) //Request header
                .expect(200)
                .then((res) => {
                    expect(res.body).toBeDefined(); //test if response body is defined
                    //expect(res.body.status).toBe("success")
                    userA_id = res.body._id;
                    let jsonContent = JSON.stringify({userA: res.body}); // create a json
                    fs.writeFile("userA.json", jsonContent, 'utf8', function (err) //write user id into global json file to be used 
                    {
                    if (err) {
                        return console.log(err);
                    }
                    // console.log("POST response body : ", res.body)
                    });
                  })
                })
              }
              catch(err){
                console.log("Exception : ", err)
              }
        });


//Create user_B
describe("POST a new userB request", () => {
  try{
    let userDetails;
    beforeEach(function () {  
        console.log("Input user details!")
        userDetails = {
          name: "user_B", dob: '1993-10-23', address: 'Beijing', geolocation: {latitude: 39.9, longitude: 116.3},
          description: 'I am user_B in Beijing.'
      }; //new user details to be created
      });
    
    afterEach(function () {
      console.log("UserB is created with Id : ", userB_id)
    });

	  it("Create user data", async () => {
        return request.request.post(`API_demo/api/user`) //post() of supertest
                //.set('Authorization', `Token $  {request.token}`) //Authorization token
                .send(userDetails) //Request header
                .expect(200)
                .then((res) => {
                    expect(res.body).toBeDefined(); //test if response body is defined
                    //expect(res.body.status).toBe("success")
                    userB_id = res.body._id;
                    let jsonContent = JSON.stringify({userB: res.body}); // create a json
                    fs.writeFile("userB.json", jsonContent, 'utf8', function (err) //write user id into global json file to be used 
                    {
                    if (err) {
                        return console.log(err);
                    }
                    // console.log("POST response body : ", res.body)
                    });
                  })
                })
              }
              catch(err){
                console.log("Exception : ", err)
              }
        });

// make userA follow userB.
describe("POST a userA following userB request", () => {
  try{
    let followingInfo;
    beforeEach(function () {  
        followingInfo = {
          userId: userA_id, followingId: userB_id
      };
    });
    
    afterEach(function () { });

	  it("Create following request", async () => {
        return request.request.post(`API_demo/api/user/follow`) //post() of supertest
                //.set('Authorization', `Token $  {request.token}`) //Authorization token
                .send(followingInfo) //Request header
                .expect(200)
                .then((res) => {
                    expect(res.body).toBeDefined(); //test if response body is defined
                    //expect(res.body.status).toBe("success")
                    let jsonContent = JSON.stringify({userId: res.body}); // create a json
                    fs.writeFile("userB_after_being_followed_by_userA.json", jsonContent, 'utf8', function (err) //write user id into global json file to be used 
                    {
                    if (err) {
                        return console.log(err);
                    }
                    // console.log("POST response body : ", res.body)
                    });
                  })
                })
              }
              catch(err){
                console.log("Exception : ", err)
              }
  });

// Get userA's nearby friends(userB's detail plus the distance between them)
// /user/:userId/nearby
describe("GET distance between userA and userB", () => {
  try{
    beforeEach(function () { });
    afterEach(function () { });

	  it("Create request to get distance between nearby friends", async () => {
        return request.request.get(`API_demo/api/user/${userA_id}/nearby`)
                //.set('Authorization', `Token $  {request.token}`) //Authorization token
                // .send(followingInfo) //Request header
                .expect(200)
                .then((res) => {
                    expect(res.body).toBeDefined(); //test if response body is defined
                    //expect(res.body.status).toBe("success")
                    let jsonContent = JSON.stringify({userA_nearby: res.body}); // create a json
                    fs.writeFile("userA_nearby.json", jsonContent, 'utf8', function (err) //write user id into global json file to be used 
                    {
                    if (err) {
                        return console.log(err);
                    }
                    // console.log("POST response body : ", res.body)
                    });
                  })
                })
              }
              catch(err){
                console.log("Exception : ", err)
              }
        });

// make userA unfollow userB
describe("POST a userA unfollowing userB request", () => {
  try{
    let unfollowingInfo;
    beforeEach(function () {  
        unfollowingInfo = {
          userId: userA_id, followingId: userB_id
      };
    });
    
    afterEach(function () { });

	  it("Create unfollowing request", async () => {
        return request.request.post(`API_demo/api/user/unfollow`) //post() of supertest
                //.set('Authorization', `Token $  {request.token}`) //Authorization token
                .send(unfollowingInfo) //Request header
                .expect(200)
                .then((res) => {
                    expect(res.body).toBeDefined(); //test if response body is defined
                    //expect(res.body.status).toBe("success")
                    let jsonContent = JSON.stringify({userId: res.body}); // create a json
                    fs.writeFile("userB_after_being_unfollowed_by_userA.json", jsonContent, 'utf8', function (err) //write user id into global json file to be used 
                    {
                    if (err) {
                        return console.log(err);
                    }
                    // console.log("POST response body : ", res.body)
                    });
                  })
                })
              }
              catch(err){
                console.log("Exception : ", err)
              }
  });

// GET all users
describe("GET users request", () => {
  try{
    let userDetails;
    beforeEach(function () {  
        console.log("Getting user list");
      });
    
    afterEach(function () {
      console.log("user list returned")
    });

	  it("Get userList data", async () => {
        return request.request.get(`API_demo/api/users`) //post() of supertest
                //.set('Authorization', `Token $  {request.token}`) //Authorization token
                // .send(userDetails) //Request header
                .expect(200) //response to be 201
                .then((res) => {
                    // console.log('res from API call: ', res.body)
                    expect(res.body).toBeDefined(); //test if response body is defined
                    //expect(res.body.status).toBe("success")
                    // userID = res.body.id;
                    let jsonContent = JSON.stringify({userList: res.body}); // create a json
                    fs.writeFile("all_users_info.json", jsonContent, 'utf8', function (err) //write user id into global json file to be used 
                    {
                    if (err) {
                        return console.log(err);
                    }
                    });
                  })
                })
              }
              catch(err){
                console.log("Exception : ", err)
              }
        });

