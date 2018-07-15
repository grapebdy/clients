var fs = require('fs');
var request = require('request');

function heartbit() {
    request({
        uri: "http://localhost:8000/index",
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        agent: false,
    }, function(err, res, body) {
        if (!err && res.statusCode == 200) {
            console.log("res.statusCode 200 "+res.body);
        } else {
            console.log("updatetemplate responce error ");
        }
    });
}

heartbit();
