var stream = require('stream');
var events = require('events');
var util = require('util');
var uuid = require('node-uuid');

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
            RowKey: entGen.String(new Date().getTime().toString()) + "-" + uuid.v4(),
            value: entGen.String(chunk.toString())
		}

		tableService.insertEntity(table,entity, function (error, result, response) {
			callback(error);	
		});
	}
}

util.inherits(TableWriter, stream.Writable);




var TableReader = function(azure, tableService, table, partition){
	stream.Readable.call(this);
	done = false;

	TableReader.prototype._read = function(){

		if (done) return;

		that = this;
		var query = new azure.TableQuery().where('PartitionKey eq ?', partition);

		var runQuery = function(continuationToken){
			tableService.queryEntities(table, query, continuationToken, function(error, result, response){
				if (done) return;

				if (error) that.emit('error', error);

				if (result && result.entries){
					result.entries.forEach(function(x){
						if (x.value._) that.push(x.value._);
					});
				}

				if (result && result.continuationToken){
					setImmediate(runQuery, result.continuationToken);
				} else {
					that.push(null);
					done = true;
				}
			});
		}

		runQuery();
	}
}

util.inherits(TableReader, stream.Readable);

