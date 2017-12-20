var Electron = require('electron');
var AWS = require('aws-sdk');
var Datastore = require('nedb');

var s3;
var db;

const app = Electron.remote.app;

initAWS();
initDB('keys');

var output = $('#output');
var bucketName = 'assets.bpwalters.com';
var initFolderName = 'images/';

init();

$(document).on('click', '#output ul li a', function () {
    loadFromBucket(bucketName, $(this).attr('data-src'));
});

function init () {
    loadFromBucket(bucketName, initFolderName);
}

function loadFromBucket(bucketName, folderName) {
    getS3Objects(bucketName, folderName, false, function (data) {
        var ul = $('<ul></ul>');

        var topA = $('<a></a>');
        topA.html('/');
        topA.attr('href', '#');
        topA.attr('data-src', '');

        var topLi = $('<li></li>');
        topLi.html(topA);

        ul.append(topLi);

        data.forEach(function (d) {
            var a = $('<a></a>');
            a.html(d);
            a.attr('href', '#');
            a.attr('data-src', d);

            var li = $('<li></li>');
            li.html(a);

            ul.append(li);
        });

        output.empty();

        output.append(ul);
    });
}

function initAWS() {
    AWS.config.loadFromPath(app.getAppPath('userData') + '/app/config/aws_config.json');
    
    s3 = new AWS.S3();
}

function initDB(dbName) {
    db = new Datastore({
        filename: app.getAppPath('userData') + '/app/db/' + dbName + '.db',
        autoload: true
    });
}

function testInsertKeysDb() {
    var doc = {
        name: 'Ben Walters',
        age: 25,
        interests: [ 'Subaru', 'cats', 'beer' ]
    };

    keysDb.insert(doc, function (err, newDoc) {
        if (err) {
            console.log(err);
        }
        else {
            console.log('Record successfully added!');
        }
    })
}

// Need to pass folder name with trailing forward-slash to return contents of given folder
function getS3Objects(bucketName, folderName, imgOnly, callback) {
    if (!folderName) {
        folderName = '';
    }

    var objects = [];
    var opts = {
        Bucket: bucketName,
        Prefix: folderName,
        Delimiter: '/'
    };

    s3.listObjectsV2(opts, function (err, data) {
        if (err) {
            console.log(err);
        }
        else {
            data.CommonPrefixes.forEach(function (obj) {
                //console.log(obj);
                objects.push(obj.Prefix);
            });

            data.Contents.forEach(function (obj) {
                //console.log(obj);
                objects.push(obj.Key);
            });
        }
        
        objects.sort()

        callback(objects);
    });
}