# azure-table-streamer

__WARNING: this package makes some serious assumptions about how you use table storage, this is not general purpose__

A module to read/write text records to azure table storage. 

Data is appended to a given partition, RowKeys are automatically generated.


## Install

```
npm install azure-table-streamer
```

## Usage

Set up the module:

```js
// you must require azure
var azure = require('azure-storage');

var AzureTableStreamer = require('azure-table-streamer');
var streamer = AzureTableStreamer(azure, azure.createTableService("UseDevelopmentStorage=true"));
```

Write stream:

```js
var writer = streamer.writer("foo", "partition1")

// write a single record
writer.write("foo bar baz", function(err){
	// written
});

// or pipe
process.stdin.pipe(writer);
```

Read stream:

```js
var reader = streamer.reader("foo", "partition1")

reader.on("data", function(x){
	console.log(x.toString());
});

// or pipe
reader.pipe(process.stdout);
```

## How it works

Table Storage is optimised for append writes. This module observes that, and creates row keys for you in ascending order (using a timestamp). 

The table entity will have one field `value`, which holds the text streamed into it.

There is no delete or update.

## License

MIT