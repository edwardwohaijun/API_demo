let mongoose = require('mongoose');

mongoose.Promise = global.Promise;
// let sysConfig = require('../config/systemConfig')();
// let mongoURL = sysConfig.mongoDB.url;

// db: site_manager, collections: cras, projects, sitecontacts(depreicated), sites
mongoose.connect('mongodb://localhost/API_demo', function(err) {
  if (err) {
    console.log('err connecting mongoDB: ', err)
  } else {
    console.log('Connected to mongodb!')
  }
});

let user_Schema = mongoose.Schema({
  versionKey: false,
  // id: String, // add indexing on this field to improve performance.
  name: String,
  dob: Date,
  geolocation: {latitude: {type: Number}, longitude: {type: Number}},
  address: String,
  description: String,
  createdAt: String,

  // not scalable, each document has a max 16MB limit, each objectId takes 12bytes
  // 16Mb/12 = 1,333,333, so roughly speaking, following and followers can each has 666,666 values
  following: [{
    type: mongoose.Schema.ObjectId, default: [ ]
  }], // array of id
  followers: [{
    type: mongoose.Schema.ObjectId, default: [ ]
  }]
})


exports.user = mongoose.model('user', user_Schema);

// in mongo cmd shell, when creating new collection, use pluralized name, like: sites, CRAs, projects,
// but in the following .model() call, first argument should be the collection name in single format, like: site, CRA, project.
// exports.site = mongoose.model('site', SiteSchema);
// exports.siteContact = mongoose.model('sitecontact', SiteContactSchema);
// exports.project = mongoose.model('project', ProjectSchema);
// exports.CRA = mongoose.model('cra', CRA_Schema);
