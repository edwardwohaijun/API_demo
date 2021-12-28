var fs = require('fs');
let path = require('path');

let http = require('http');

const express = require('express');

// const os = require('os');
const app = express();
const bodyParser = require('body-parser');

app.use( bodyParser.urlencoded({ extended: true }) );
app.use(bodyParser.json());
// app.use(express.static(path.join(__dirname, 'public')));
/*
app.use('/javascripts', express.static(path.join(__dirname, 'public/javascripts')));
app.use('/stylesheets', express.static(path.join(__dirname, 'public/stylesheets')));
*/
// the above 2 lines also work, but too cumbersome
app.use('/API_demo/public', express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

let server = http.createServer(app);
server.listen(3030);
console.log('listening on 3030')

const apiRoute = require('./routes/api');
app.use('/API_demo/api', apiRoute)

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
})
// app.get('/api/getUsername', (req, res) => res.send({ username: os.userInfo().username }));
// even 404 is handled on client-side
// app.use('/api', apiRoute);

app.get('*', (req, res) => {
  console.log('catch all req: ', )
  res.render('index.ejs', {})
})


// app.listen(process.env.PORT || 8080, () => console.log(`Listening on port ${process.env.PORT || 8080}!`));
