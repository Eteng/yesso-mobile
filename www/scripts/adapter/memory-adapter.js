var MemoryAdapter = function(){
	
	//the constructor
	this.initialize = function(){
		//No initialization required 
		var deferred = $.Deferred();
		deferred.resolve();
		return deferred.promise();
	}

	this.findById = function(id){
		var deferred = $.Deferred();
		var row = null;
		var l = rowset.length;
		for (var i=0; i < l; i++){
			if(rowset[i].id == id){
				row = rowset[i];
				break;
			}		
		}
		deferred.resolve(row);
		return deferred.promise();
	}
}