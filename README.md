# Description
This app demonstrate a set of Create/Read/Update/Delete API.

# Pre-requisite
* NodeJS
* MongoDB

# Installation and get it up and running
```
git clone https://github.com/edwardwohaijun/API_demo
cd API_demo
npm install
npm run build
cd src/server
node index.js
```
Open browser and go to http://localhost:3030/API_demo

# Testing
Run `npm test` to test the backend API:
* one request to create userA, userB (with their geolocation hard-coded)
* one request to make userA follow userB
* one request to get the distance between userA and userB
* one request to make userA unfollow userB
* one request to get all the users

