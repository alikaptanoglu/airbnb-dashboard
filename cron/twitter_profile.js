var cron 						= require('node-cron');

// models
var Account         = require('../models/account');
var Observation     = require('../models/observation');

// request options
var options  				= require('../observer/options/twitterOptions');

var findKeyValue    = require('../observer/helpers.js').findKeyValue; 
var requester 			= require('../observer/requester')();

var parser 					= require('../observer/parsers/twitter_parser')();

function profiler() {
	Account.find({service: 'twitter'}).populate('service_name').exec(function(err, accounts) {
	 	accounts.forEach(function(account) {
	 		var reqOptions = options.getProfileOptions(account);

		 	requester.requestProfile(reqOptions, function(err, response, body) {
		 		if (err) return err;
		  	if (body) {
		  		parser.profileParser(body, function(results) {
			  		var newObservation = new Observation();
			  		newObservation.saveObservation(account, results.followerCount, results.profileData, body);
		  		});
	  	  }
	  	  return true;
		 	})
	 	})
	})
}

var task = cron.schedule('0 2 0,12 * * *', profiler, false);

task.start();

exports.twitterProfiler = profiler;