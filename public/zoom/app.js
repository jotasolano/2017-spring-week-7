console.log(d3);

/*Example 1: Basic zoom usage
*/
var m = {t:20,r:20,b:20,l:20},
	w = d3.select('#plot1').node().clientWidth - m.l - m.r,
	h = d3.select('#plot1').node().clientHeight - m.t - m.b;
var svg = d3.select('#plot1').append('svg')
	.attr('width',w + m.l + m.r)
	.attr('height',h+ m.t + m.b);
var plot1 = svg.append('g')
	.attr('transform','translate('+m.l+','+m.t+')');

for(var y = 0; y<=h; y+= h/10){
	for(var x = 0; x<=w; x+= w/30){
		plot1.append('circle')
			.attr('cx',x)
			.attr('cy',y)
			.attr('r',3)
			.style('stroke','black')
			.style('stroke-width','1px')
			.style('fill','none');
	}
}

//Part 1: define zoom behavior

//Part 2: event listeners

//Part 3: apply zoom behavior

//Part 4: setting zoom transform programmatically

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

	//Create a map module
/*	var map = Map()
		.height(600);
	d3.select('#plot2').datum(stations).call(map);
*/
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