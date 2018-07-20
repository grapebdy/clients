var fs = require('fs');
var async = require('async');
var request = require('request');
var exec = require('child_process').exec;

function config(path, callback) {
	var data = fs.readFileSync(path, "utf-8");
	console.log(data);
	console.log(data.port);
	jdata = JSON.stringify(data),
	console.log(jdata);
	callback(null, data);
}
exports.config= config;

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
//		uri: "http://manage-center:9000/users/test",
		uri: "http://" + global.config.serverip +":" + global.config.port + "/users/test",
		method: "POST",
		json: true,
		headers: {
		'Content-Type': 'application/json'
		},
		body: data,
//		body: JSON.stringify(data),
	}, function(err, res, body) {
		if (!err && res.statusCode == 200) {
			callback(null, body);
		} else {
			callback("responce err", null);
		}
	});
}

function gpt_getsn(callback) {
	cmd_exec("bin/netiface -m -d" + global.config.netdev, function(stderr, stdout) {
		if (stderr == null) {
			var data = stdout.split('\n')[0];
			callback(null, data);
		} else {
			callback(stderr, null);
		}
	});
}

function gpt_getip(callback) {
	cmd_exec("bin/netiface -i -d" + global.config.netdev, function(stderr, stdout) {
		if (stderr == null) {
			var data = stdout.split('\n')[0];
			callback(null, data);
		} else {
			console.log("get ip error");
			callback(stderr, null);
		}
	});
}

function gpt_test(callback) {
	cmd_exec("date", function(stderr, stdout) {
		if (stderr == null) {
			var data = stdout.split('\n')[0];
			console.log(data);
			callback(null, data);
		} else {
			callback(stderr, null);
		}
	});
}

function run_cmds(cmd, callback) {

	if (cmd == null) {
		callback("failed", "cmd is null");
		return;
	}

	if (cmd == "ls") {
		cmd_exec(cmd, function(stderr, stdout) {
			if (stderr != null) {
				callback("failed", stdout);
			} else {
				callback("pass", stdout);
			}
		});

	} else if (cmd == "date") {
		cmd_exec("date +%s", function(stderr, stdout) {
			if (stderr != null) {
				callback("failed", stdout);
			} else {
				var data = stdout.split('\n')[0];
				callback("pass", data);
			}
		});

	} else {
		cmd_exec(cmd, function(stderr, stdout) {
			if (stderr != null) {
				callback(cmd + " failed", stdout);
			} else {
				callback(null, null);
			}
		});
	}
}

function main() {
	var record = {};

	async.series({
		sn: gpt_getsn,
		ip: gpt_getip,
		test: gpt_test,
	}, function(err, result) {
		if (err) {
			console.log("get infomation failed");
		} else {
			record.sn = result.sn;
			record.ip = result.ip;
			heartbit(record, function(err, data) {
				if (err) {
					console.log(err);
					setTimeout(main, 5000);
				} else {
					console.log(data);
					run_cmds(data.cmd, function(stderr, stdout) {
						if (stderr != null)
							console.log(stdout);

						setTimeout(main, 3000);
					});
				}
			});
		}
	});
}
exports.main = main;
