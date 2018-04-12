// add jquery data to appended svg elements?

function iGToInt(iG) {
	if (iG == 'Under $10,000') {
		return 0;
	} else if (iG == '$10,000 to $19,999') {
		return 1;
	} else if (iG == '$20,000 to $29,999') {
		return 2;
	} else if (iG == '$30,000 to $39,999') {
		return 3;
	} else if (iG == '$40,000 to $49,999') {
		return 4;
	} else if (iG == '$50,000 to $59,999') {
		return 5;
	} else if (iG == '$60,000 to $69,999') {
		return 6;
	} else if (iG == '$70,000 to $79,999') {
		return 7;
	} else if (iG == '$80,000 to $89,999') {
		return 8;
	} else if (iG == '$90,000 to $99,999') {
		return 9;
	} else if (iG == '$100,000 and over') {
		return 10;
	}   
}

function houseToInt(family) {
	if (iG == 'One person household') {
		return 0;
	} else if (iG == 'Two-or-more person non-census-family household') {
		return 1;
	} else if (iG == 'One couple census family with other persons in the household') {
		return 2;
	} else if (iG == 'One couple census family without other persons in the household') {
		return 3;
	} else if (iG == 'One-census-family households with additional persons') {
		return 4;
	} else if (iG == 'One-census-family households without additional persons') {
		return 5;
	} else if (iG == 'One lone-parent census family with other persons in the household') {
		return 6;
	} else if (iG == 'One lone-parent census family without other persons in the household') {
		return 7;
	}
}




// SETTINGS
var scale = 'name' // 'country', 'province', 'name', 'national', 'provincial', 'municipal'

var selection = ['CAN'];

// if scale is larger than selections, only use selected items for that bin


// BOUNDS
var margin = {top: 30, right: 50, bottom: 50, left: 70},
	outerWidth = 550,
	outerHeight = 550,
	innerWidth = outerWidth - margin.left - margin.right,
	innerHeight = outerHeight - margin.top - margin.bottom;

// SCALE
var xScale = d3.scaleLinear().range([0, innerWidth]);
var yScale = d3.scaleLinear().range([0, innerHeight]);
var yScaleFlip = d3.scaleLinear().range([innerHeight, 0]);

// AXIS
var xAxis = d3.axisBottom(xScale).ticks(5);
var yAxis = d3.axisLeft(yScale).ticks(5);

var color = d3.scaleOrdinal(d3.schemeCategory20);   // set the colour scale
var colorScale = d3.scaleSequential(d3.interpolateRainbow)
    .domain([0, 10]);


// ADD CHART (cannot be named svg or else would over lap it)
var lineChart = d3.select('#area1')
	.append('svg')
	.attr('width', outerWidth)
	.attr('height', outerHeight)
		.append('g')
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

var stackChart = d3.select('#area2')
	.append('svg')
	.attr('width', outerWidth)
	.attr('height', outerHeight)
		.append('g')
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

var rankChart = d3.select('#area3')
	.append('svg')
	.attr('width', outerWidth)
	.attr('height', outerHeight)
		.append('g')
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

// Add the X Axis
lineChart.append('g')
	.attr('class', 'xAxis')
	.attr('transform', 'translate(0,' + outerHeight + ')')
	.call(xAxis);

stackChart.append('g')
	.attr('class', 'xAxis')
	.attr('transform', 'translate(0,' + outerHeight + ')')
	.call(xAxis);

rankChart.append('g')
	.attr('class', 'xAxis')
	.attr('transform', 'translate(0,' + outerHeight + ')')
	.call(xAxis);

// Add the Y Axis
lineChart.append('g')
	.attr('class', 'yAxis')
	.call(yAxis);

stackChart.append('g')
	.attr('class', 'yAxis')
	.call(yAxis);

rankChart.append('g')
	.attr('class', 'yAxis')
	.call(yAxis);

// DATA
d3.csv('dataset.csv', function(error, data) {
	// CONVERT
	data.forEach(function(d) {
		d.country = d.country;
		d.province = d.province;
		d.name = d.name;
		d.incomeGroup = d.incomeGroup;
		d.houseType = d.houseType;
		d.costIncomeRatio = d.costIncomeRatio;
		// converts to number or 0
		d.tenureOwner = +d.tenureOwner || 0;
		d.tenureRenter = +d.tenureRenter || 0;
		d.tenureBand = +d.tenureBand || 0;
	});

	function createSelection(column, selection) {
		// MAKE NESTED DATA
		var dataNest = d3
			// nest by name, then incomeGroup
			.nest()
			.key(function(d) { return d[column]; })
			.key(function(d) { return d.incomeGroup; })
			// for each subgroup
			.rollup(function(d) {
				// return a set of calculated values
				var total = d3.sum(d, function(d) { 
					var total = d3.sum([d.tenureOwner, d.tenureRenter, d.tenureBand]);
					return total;
				});
				var under30 = d3.sum(d, function(d) {
					var total = d3.sum([d.tenureOwner, d.tenureRenter, d.tenureBand]);
					if (d.costIncomeRatio == 'Spending less than 30% of income on shelter costs') {
						return total;
					} else {
						return 0;
					}
				});
				var ratio = total !== 0 ? (under30 / total) : 0;

				// as an object
				return {
					'total': total,
					'under30': under30,
					'ratio': ratio,
				};
			})
			// supply dataset
			.entries(data);

		
		// create same variables for first level
		dataNest.forEach(function(d) {
			d['total'] = 0;
			d['under30'] = 0;
			d.values.forEach(function(e) {
				d.total += e.value.total;
				d.under30 += e.value.under30;
			});
			d['ratio'] = d.total !== 0 ? (d.under30 / d.total) : 0;
		});

		// sort first level from high population to low
		dataNest.sort(function(x, y) {
			return d3.descending(x.total, y.total);
		});

		// sort incomeGroups (so line draws in right order)
		dataNest.forEach(function(d) {
			d.values.sort(function(x, y) {
				return d3.ascending(iGToInt(x.key), iGToInt(y.key));
			});
		});	

		return dataNest;
	}

	var dataNest = createSelection(scale, selection);

	// find all total
	var allTotal = 0;
	dataNest.forEach(function(d) {
		allTotal += d.total;
	});

	console.log(dataNest);

	var houseDataNest = createSelection('houseType', selection);


	// find all total
	var houseAllTotal = 0;
	houseDataNest.forEach(function(d) {
		houseAllTotal += d.total;
	});

	console.log(houseDataNest);


	// LINE CHART
	// scale
	// x, incomeGroup index, min to max
	xScale.domain([
		// min of
		d3.min(dataNest, function(d) { 
			// min of incomeGroup index
			var n = d3.min(d.values, function(d) {
				return iGToInt(d.key);
			});
			return n; 
		}),
		// to max of
		d3.max(dataNest, function(d) { 
			// max of incomeGroup index
			var n = d3.max(d.values, function(d) {
				return iGToInt(d.key);
			});
			return n; 
		})
	]);
	// y, ratio, 0 to max
	yScale.domain([0, 
		// max of
		d3.max(dataNest, function(d) { 
			// max of incomeGroup ratio
			var n = d3.max(d.values, function(d) {
				return d.value.ratio;
			});
			return n; 
		})
	]);

	// define line
	var line = d3.line() 
		.x(function(d) { return xScale(iGToInt(d.key)); })
		.y(function(d) { return yScale(d.value.ratio); })
		.curve(d3.curveMonotoneX);

	// apply
	dataNest.forEach(function(d, i) { 
		// append an svg <path>
		lineChart.append('path')
			// class='line'
			.attr('class', 'line')
			// ??? add colors dynamically
			.style('stroke', function() { return d.color = color(d.total); })
			// d='val, val, val'
			.attr('d', line(d.values));
	});

	// STACK CHART
	xScale.domain([0, houseAllTotal]);
	yScale.domain([0, 1]);
	yScaleFlip.domain([0, 1]);

	var xOffset = 0;
	houseDataNest.forEach(function(d, i) { 
		// for each group item
		// reset yOffset
		var yOffset = 0;
		d.values.forEach(function (e, j) {
			// for each income group
			// get ratio for yRange
			totalRatio = e.value.under30 / d.total;

			// increment yOffset before (because of rect's top y-origin)
			yOffset += totalRatio;
			
			stackChart.append('rect')
				.attr('class', 'segment')
				.attr('x', xScale(xOffset))
				.attr('y', yScaleFlip(yOffset))
				.attr('width', xScale(d.total))
				.attr('height', yScale(totalRatio))
				.style('fill', function() { return colorScale(iGToInt(e.key)) });
		});
		// increment xOffset after (because of rect's left x-origin)
		xOffset += d.total;
	});

	// RANK CHART

var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([-10, 0])
  .html(function(d) {
    return 'tip';
  });



	xScale.domain([0, allTotal]);
	yScale.domain([0, 1]);
	yScaleFlip.domain([0, 1]);

	var xOffset = 0;
	dataNest.forEach(function(d, i) {
		// for each group item
		// reset yOffset
		var yOffset = 0;
		d.values.forEach(function (e, j) {
			// for each income group
			// get ratio for yRange
			totalRatio = e.value.under30 / d.total;

			// increment yOffset before (because of rect's top y-origin)
			yOffset += totalRatio;
			
			rankChart.append('rect')
				.attr('x', xScale(xOffset))
				.attr('y', yScaleFlip(yOffset))
				.attr('width', xScale(d.total))
				.attr('height', yScale(totalRatio))
				.style('fill', function() { return colorScale(iGToInt(e.key)) })
				.attr('class', 'segment')
				.on('mouseover', tip.show)
				.on('mouseout', tip.hide)
		});
		// increment xOffset after (because of rect's left x-origin)
		xOffset += d.total;
	});

	rankChart.call(tip);

	// OTHER

	//HOVER OVER LINE. SHOW INFO. At the moment shows the 'highest' point of all the points for that city.. need to figure out how to show just the points.
	lineChart.selectAll('path')
		.data(data)
		.append('title')
		.text(function(d) {
			return d.tenure + ' tenure ' + d.fraction + ' fraction' + d.income + ' income range' + d.name;
		});
});