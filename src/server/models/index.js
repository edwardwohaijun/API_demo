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
  address: String, // geolocation: {lat, longt}
  description: String,
  createdAt: String,

  // not scalable, each 
  following: [{
    type: mongoose.Schema.ObjectId, default: [ ]
  }], // array of id
  followers: [{
    type: mongoose.Schema.ObjectId, default: [ ]
  }]
})

// _id: '0', name: '周姗0', email: '0@dmedGlobal.com', level: 'CRA II', onboardDate: '2017-07-03',
//location: 'SH', manager: '16', isReleased: true, isOutsourced: true, assignedSites: ['1000', '1001', '1002'], role: 2, dataEntryAllowed: false,  },
// this collection also serves the user login purpose
/*
let CRA_Schema = mongoose.Schema({
  versionKey: false,
  name: String,
  loginName: String,
  password: String,
  // password: String, // todo: to be implemented soon
  // email: String, // todo: depreicate it
  level: String,
  onboardDate: Date,
  offboardDate: Date, 
  location: String,
  // manager: mongoose.Schema.Types.ObjectId,
  manager: String,
  // isReleased: Boolean,
  // isOutsourced: Boolean,
  // assignedSites: [mongoose.Schema.Types.ObjectId],
  assignedSites: [String], // 主要给 CRA 用
  assignedProjects: [String], // this field is for project manager only
  role: Number,
  dataEntryAllowed: Boolean,
});
*/

exports.user = mongoose.model('user', user_Schema);

// in mongo cmd shell, when creating new collection, use pluralized name, like: sites, CRAs, projects,
// but in the following .model() call, first argument should be the collection name in single format, like: site, CRA, project.
// exports.site = mongoose.model('site', SiteSchema);
// exports.siteContact = mongoose.model('sitecontact', SiteContactSchema);
// exports.project = mongoose.model('project', ProjectSchema);
// exports.CRA = mongoose.model('cra', CRA_Schema);
