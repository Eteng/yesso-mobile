(function(){
   /*-----Local variables here ---*/
   var adapter = new MemnoryAdapter();
   adapter.initialize().done(function(){
   	  console.log("Data adapter initialized!");
   })
   app.prototype.adapter = adapter;



  /*------event registration------*/
  $(".search-key").on('keyup', findByName)


   /*------local function---------*/
   function findByName(){
   	 adapter.findByName($(".search-key").val()).done(function(deals){
   	 	var l = deals.length;
   	 	var e;
   	 	$(".deals-list").empty();
   	 	for (var i = 0; i < l; i++) {
   	 		e  = deals[i]
   	 		$(".deals-list").append('<li><a href="x/'+e.id+'">'+e.display+ '</a></li>');
   	 	}
   	 });

   }

})