function Piechart(){
	var m = {t:20,r:20,b:20,l:20},
		w, h,
		_innerRadius, _outerRadius,
		_accessor = function(d){ return d.userType },
		_colorRamp = [
			'rgb(150,150,150)',
			'#eee',
			'#ef4136',
			'#d1d3d4',
			'#00ac75'
		];

	var exports = function(selection){
		var arr = selection.datum();
		w = w || selection.node().clientWidth - m.l - m.r;
		h = h || selection.node().clientHeight - m.t - m.b;
		_outerRadius = Math.min(w,h)/2 - 60;
		_innerRadius = 8;

		//transform data 
		var arrNested = d3.nest()
			.key(_accessor)
			.rollup(function(leaves){return leaves.length})
			.entries(arr);

		var pie = d3.pie()
			.value(function(d){return d.value});

		var arrPie = pie(arrNested);


		//Arc <path> generator
		var arc = d3.arc()
			.innerRadius(_innerRadius)
			.outerRadius(_outerRadius);


		//Append or update DOM structure
		var svg = selection.selectAll('svg').data([arrPie]),
			svgEnter = svg.enter().append('svg')
			.attr('width',w+m.l+m.r)
			.attr('height',h+m.t+m.b);

		svgEnter.append('g').attr('class','pie-chart');
		var plot = svgEnter.merge(svg)
			.select('.pie-chart')
			.attr('transform','translate('+(m.l+w/2)+','+(m.t+h/2)+')');

		var slices = plot.selectAll('.slice').data(arrPie,function(d){return d.data.key}),
			slicesEnter = slices.enter().append('g').attr('class','slice'),
			slicesExit = slices.exit().remove();
		slicesEnter.append('path');
		slicesEnter.append('text');
		slicesEnter.append('line');

		slicesEnter.merge(slices)
			.select('path')
			.on('click',function(d){
				console.log(d);
			})
			.transition()
			.attr('d',arc)
			.style('fill',function(d,i){
				return _colorRamp[i%5];
			})
		slicesEnter.merge(slices)
			.select('text')
			.attr('dy',5)
			.text(function(d){return d.data.key + ' ' + d.data.value})
			.transition()
			.attr('text-anchor',function(d){
				var angle = ((d.startAngle + d.endAngle)/2)*180/Math.PI - 90;
				if(angle>90 && angle <270){
					return 'end'
				}else{
					return 'start';
				}
			})
			.attr('transform',function(d){
				var angle = ((d.startAngle + d.endAngle)/2)*180/Math.PI - 90;
				if(angle>90 && angle <270){
					return 'rotate('+(angle-180)+')translate('+(-_outerRadius-20)+')';
				}else{
					return 'rotate('+ angle +')translate('+(_outerRadius+20)+')';
				}
			})
		slicesEnter.merge(slices)
			.select('line')
			.attr('x1', (_innerRadius+_outerRadius)/2)
			.attr('x2', _outerRadius+15)
			.attr('transform',function(d){
				var angle = ((d.startAngle + d.endAngle)/2)*180/Math.PI - 90;
				return 'rotate('+ angle +')';
			});
	}

	exports.value = function(_){
		if(!arguments.length) return _accessor;
		_accessor = _;
		return this;
	}

	return exports;
}