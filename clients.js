var fs = require('fs');
var async = require('async');
var request = require('request');
var exec = require('child_process').exec;

function cmd_exec(cmd, callback) {
	exec(cmd, {maxBuffer:1024*1920}, function (err, stdout, stderr) {
		if (err) {
			callback(stderr, null);
		} else {
			callback(null, stdout);
		}
	});
}

function heartbit(data, callback) {
	request({
		uri: "http://localhost:9000/users/test",
		method: "POST",
		json: true,
		headers: {
		'Content-Type': 'application/json'
		},
		body: data,
//		body: JSON.stringify(data),
	}, function(err, res, body) {
		if (!err && res.statusCode == 200) {
			console.log(body.sn + " : " + body.ip);
		} else {
			console.log("responce error ");
		}
	});
}

function gpt_getsn(callback) {
	cmd_exec("echo 12345678", function(stderr, stdout) {
		if (stderr == null) {
			var data = stdout.split('\n')[0];
			callback(null, data);
		} else {
			callback(stderr, null);
		}
	});
}

function gpt_getip(callback) {
	cmd_exec("echo 192.168.1.1", function(stderr, stdout) {
		if (stderr == null) {
			var data = stdout.split('\n')[0];
			callback(null, data);
		} else {
			console.log("get ip error");
			callback(stderr, null);
		}
	});
}

function main() {
	var record = {};

	async.series({
		sn: gpt_getsn,
		ip: gpt_getip,
	}, function(err, result) {
		if (err) {
			console.log("failed");
		} else {
			record.sn = result.sn;
			record.ip = result.ip;
			heartbit(record, function(err, data) {
				if (err) {
					console.log(err);
				} else {
					console.log("success");
				}
			});
		}
	});

}
main();
