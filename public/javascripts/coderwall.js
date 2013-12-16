var coderwall = (function(){
	function render(target,res){
    	var i = 0, fragment = '', t = $(target);
    	var url='https://coderwall.com/'+res.username;
    	var lgi=$('<div "list-group-item"/>'),ct=$('<div class="container"/>'),row;
    	for(i = 0; i < res.badges.length; i++) {
    		var v=res.badges[i];
    		if(i%3==0){
    			row=$('<div class="row"/>').appendTo(ct);
    		}
    		fragment='<div class="col-md-4">';
    		fragment+='<a target="_blank" class="" href="'+url+'" title="'+v.description+'">';
    		fragment+='<img class="img-responsive" alt="'+v.description+'" src="'+v.badge+'"/>';
    		fragment+='</a>';
    		fragment+='</div>';
			row.append(fragment);
	    }
	    t.empty().append(lgi.append(ct));
	}
	return {
		showRepos: function(options){
		  $.ajax({
		      url: "https://coderwall.com/"+options.user+".json?callback=?"
		    , dataType: 'jsonp'
		    , error: function (err) { $(options.target + ' li.loading').addClass('error').text("Error loading feed"); }
		    , success: function(data) {
		      var res = data.data||data;
		      if (!res) { 
		      	$(options.target).empty(); 
		      }else{
			      render(options.target, res);
			  }
		    }
		  });
		}
	};
})();
