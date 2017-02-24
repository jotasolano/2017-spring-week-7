function StationList(){
	var _dispatcher = d3.dispatch('station:select');

	var exports = function(selection){
		var arr = selection.datum();

		var menuItem = selection.selectAll('li')
			.data(arr,function(d){return d.id});
		menuItem.enter().append('li')
			.append('a')
			.attr('href','#')
			.html(function(d){
				return d.name;
			})
			.on('click',function(d){
				d3.event.preventDefault();
				console.log('StationList:select:'+d.id);
				_dispatcher.call('station:select',this,d.id);
			});
		menuItem.exit().remove();

		selection.insert('li','li')
			.datum(null)
			.append('a')
			.attr('href','#')
			.html('All stations')
			.on('click',function(d){
				d3.event.preventDefault();
				_dispatcher.call('station:select',this,null);
			});
	}

	exports.on = function(){
		_dispatcher.on.apply(_dispatcher,arguments);
		return this
	}


	return exports;
}