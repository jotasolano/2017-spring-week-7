console.log(d3);

var globalDispatch = d3.dispatch('timerange:update');

/*Example 1: Basic brush usage
*/
var m = {t:20,r:20,b:20,l:20},
	w = d3.select('#plot1').node().clientWidth - m.l - m.r,
	h = d3.select('#plot1').node().clientHeight - m.t - m.b;
var plot1 = d3.select('#plot1').append('svg')
	.attr('width',w + m.l + m.r)
	.attr('height',h+ m.t + m.b)
	.append('g')
	.attr('transform','translate('+m.l+','+m.t+')');

//Step 1: set up a brush function
var brush = d3.brush()
	.extent([[0,0],[w,h]]);

//Step 2: call brush function on a selection of <g> element
plot1.append('g').attr('class','brush')
	.call(brush);

//Step 3: define callback for "start", "brush", and "end" events
brush
	.on('start',function(d,i){
		console.log('brush:start');
		console.log(d3.event.type);
	})
	.on('brush',function(d,i){
		console.log('brush:is brushing');
		console.log(d3.event.type);
	})
	.on('brush.foo',function(d,i){
		console.log('brush:second callback');
	})
	.on('end',function(d,i){
		console.log('brush:end');
		console.log(d3.event);
	});



d3.queue()
	.defer(d3.csv,'../data/hubway_trips_reduced.csv',parseTrips)
	.defer(d3.csv,'../data/hubway_stations.csv',parseStations)
	.await(dataLoaded);

function dataLoaded(err,trips,stations){
	
	//Data model
	var cf = crossfilter(trips);
	var tripsByStartTime = cf.dimension(function(d){return d.startTime}),
		tripsByStartStation = cf.dimension(function(d){return d.startStn}),
		tripsByEndStation = cf.dimension(function(d){return d.endStn});

/*	Part 2: context + focus
*/	var timeseriesFocus = Timeseries().brushable(false),
		timeseriesContext = Timeseries()
			.on('timerange:select',function(range){
				globalDispatch.call('timerange:update',this,range);
			});

	d3.select('#plot2').datum(tripsByStartStation.top(Infinity)).call(timeseriesFocus);
	d3.select('#plot3').datum(tripsByStartStation.top(Infinity)).call(timeseriesContext);

/*	Part 3: set brush extent programmatically
*/
	var timeseriesContext2 = Timeseries()
		.snapping(true)
		.on('timerange:select',function(range){
			globalDispatch.call('timerange:update',this,range);
		});
	d3.select('#plot4').datum(tripsByStartStation.top(Infinity)).call(timeseriesContext2);


	globalDispatch.on('timerange:update',function(range){
		timeseriesFocus.domain(range);
		d3.select('#plot2').call(timeseriesFocus);
	});




}

function parseTrips(d){
	return {
		bike_nr:d.bike_nr,
		duration:+d.duration,
		startStn:d.strt_statn,
		startTime:parseTime(d.start_date),
		endStn:d.end_statn,
		endTime:parseTime(d.end_date),
		userType:d.subsc_type,
		userGender:d.gender?d.gender:undefined,
		userBirthdate:d.birth_date?+d.birth_date:undefined
	}
}

function parseStations(d){
	return {
		id:d.id,
		lngLat:[+d.lng,+d.lat],
		city:d.municipal,
		name:d.station,
		status:d.status,
		terminal:d.terminal
	}
}

function parseTime(timeStr){
	var time = timeStr.split(' ')[1].split(':'),
		hour = +time[0],
		min = +time[1],
		sec = +time[2];

	var	date = timeStr.split(' ')[0].split('/'),
		year = date[2],
		month = date[0],
		day = date[1];

	return new Date(year,month-1,day,hour,min,sec);
}