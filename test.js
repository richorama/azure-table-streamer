var azure = require('azure-storage');


var flipper = require('./index')(azure, azure.createTableService("UseDevelopmentStorage=true"));
var writer = flipper.writer("foo", "partition1")
/*
writer.write("foo bar baz");
writer.write("A");
writer.write("B");
writer.write("C");
writer.write("D");
*/
var reader = flipper.reader("foo", "partition1")
reader.on("data", console.log);
reader.read();

