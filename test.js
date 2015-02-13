var azure = require('azure-storage');
var streamer = require('./index')(azure, azure.createTableService("UseDevelopmentStorage=true"));
var writer = streamer.writer("foo", "partition1")

writer.write("foo bar baz", function(err){
	console.log(err);
});

var reader = streamer.reader("foo", "partition1")
reader.pipe(process.stdout);

