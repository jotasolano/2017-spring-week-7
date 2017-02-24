function Timeseries(){

	var T0 = new Date(2011,0,1),
		T1 = new Date(2013,11,31);
	var _interval = d3.timeDay;
	var _accessor = function(d){
		return d.startTime;
	};
	var W, H, M ={t:30,r:40,b:30,l:40};
	var brush = d3.brushX()
		.on('end',brushend)
		.on('brush', brushSnap);

	var scaleX, scaleY;
	var _dispatcher = d3.dispatch('timerange:update');

	var _brushable = true;
	var _snapping = false;

	var exports = function(selection){
		//Set initial internal values
		//Some of these will be based on the incoming selection argument
		W = W || selection.node().clientWidth - M.l - M.r;
		H = H || selection.node().clientHeight - M.t - M.b;
		var arr = selection.datum()?selection.datum():[];

		//Set brush extent
		brush.extent([[0,0],[W,H]]);

		//Histogram layout
		//The value, domain and threshold properties are internal to this function
		var histogram = d3.histogram()
			.value(_accessor)
			.domain([T0,T1])
			.thresholds(_interval.range(T0,T1,1));

		var dayBins = histogram(arr);

		var maxY = d3.max(dayBins,function(d){ return d.length; });
		scaleX = d3.scaleTime().domain([T0,T1]).range([0,W]),
		scaleY = d3.scaleLinear().domain([0,maxY]).range([H,0]);

		//Represent
		//Axis, line and area generators
		var line = d3.line()
			.x(function(d){return scaleX(d.x0)})
			.y(function(d){return scaleY(d.length)});
		var area = d3.area()
			.x(function(d){return scaleX(d.x0)})
			.y0(function(d){return H})
			.y1(function(d){return scaleY(d.length)});
		var axisX = d3.axisBottom()
			.scale(scaleX)
			.ticks(d3.timeMonth.every(1));
		var axisY = d3.axisLeft()
			.tickSize(-W)
			.scale(scaleY)
			.ticks(4);

		//Set up the DOM structure like so:
		/*
		<svg>
			<g class='plot'>
				<path class='area' />
				<g class='axis axis-y' />
				<path class='line' />
				<g class='axis axis-x' />
			</g>
		</svg>
		*/
		var svg = selection.selectAll('svg')
			.data([dayBins]);

		var svgEnter = svg.enter()
			.append('svg') //ENTER
			.attr('width', W + M.l + M.r)
			.attr('height', H + M.t + M.b);

		var plotEnter = svgEnter.append('g').attr('class','plot time-series')
			.attr('transform','translate('+M.l+','+M.t+')');
		plotEnter.append('path').attr('class','area');
		plotEnter.append('g').attr('class','axis axis-y');
		plotEnter.append('path').attr('class','line');
		plotEnter.append('g').attr('class','axis axis-x');
		plotEnter.append('g').attr('class','brush');

		//Update
		var plot = svg.merge(svgEnter)
			.select('.plot')
			.attr('transform','translate('+M.l+','+M.t+')');
		plot.select('.area').transition()
			.attr('d',area);
		plot.select('.line').transition()
			.attr('d',line);
		plot.select('.axis-y').transition()
			.call(axisY);
		plot.select('.axis-x')
			.attr('transform','translate(0,'+H+')')
			.transition()
			.call(axisX);

		if (_brushable) {
			plot.select('.brush').call(brush);
		}

	};

	function brushend(){
		if(!d3.event.selection) return;

		var s = d3.event.selection;
		var t0 = scaleX.invert(s[0]),
			t1 = scaleX.invert(s[1]);

		_dispatcher.call('timerange:update', this, [t0, t1]);

		// if(!d3.event.selection) {_dispatcher.call('timerange:select',this,null); return;}
	}

	function brushSnap(){
		if (d3.event.sourceEvent.type === "brush") return;
		var _t0 = scaleX.invert(d3.event.selection[0]), //start date
			_t1 = scaleX.invert(d3.event.selection[1]), //end date
			t0 = d3.timeMonth.floor(_t0),
			t1 = d3.timeMonth.ceil(_t1);

		d3.select(this).call(d3.event.target.move, [scaleX(t0),scaleX(t1)]); // or brush.move,
	}

	//setting config values
	//"Getter" and "setter" functions
	exports.domain = function(_){
		if(!arguments.length) return [T0,T1];
		T0 = _[0];
		T1 = _[1];
		return this;
	};

	exports.interval = function(_){
		_interval = _;
		return this;
	};

	exports.value = function(_){
		if(!arguments.length) return _accessor;
		_accessor = _;
		return this;
	};

	exports.on = function(){
		_dispatcher.on.apply(_dispatcher,arguments);
		return this;
	};

	exports.brushable = function(_){
		if(!arguments.length) return _brushable;
		_brushable = _;
		return this;
	};

	exports.snapping = function(_){
		if(!arguments.length) return _snapping;
		_snapping = _;
		return this;
	};

	return exports;
}
