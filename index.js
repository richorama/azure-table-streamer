var stream = require('stream');
var events = require("events");
var util = require("util");

module.exports = function(azure, tableService){
	return {
		reader: function(table, partition){
			return new TableReader(azure, tableService, table, partition);
		},
		writer: function(table, partition){
			return new TableWriter(azure, tableService, table, partition);
		}
	};
}

var TableWriter = function(azure, tableService, table, partition){

	stream.Writable.call(this);

	TableWriter.prototype._write = function(chunk, encoding, callback){

		var entGen = azure.TableUtilities.entityGenerator;
		var entity = {
			PartitionKey: entGen.String(partition),
            RowKey: entGen.String(new Date().getTime().toString()),
            value: entGen.String(chunk.toString())
		}

		tableService.insertEntity(table,entity, function (error, result, response) {
			callback(error);	
		});
	}
}

util.inherits(TableWriter, stream.Writable);

var TableReader = function(azure, tableService, table, partition){
	events.EventEmitter.call(this);

	this.read = function(){
		that = this;
		var query = new azure.TableQuery().where('PartitionKey eq ?', partition);
		tableService.queryEntities(table, query, null, function(error, result, response){
			if (error) return that.emit("error", error);
			if (!result) return;
			result.entries.forEach(function(x){
				that.emit("data", x.value._);
			});

		});
	}
}

util.inherits(TableReader, events.EventEmitter);

