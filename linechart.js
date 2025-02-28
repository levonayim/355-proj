// add jquery data to appended svg elements?

var income = [
	'Under $10,000',
	'$10,000 to $19,999',
	'$20,000 to $29,999',
	'$30,000 to $39,999',
	'$40,000 to $49,999',
	'$50,000 to $59,999',
	'$60,000 to $69,999',
	'$70,000 to $79,999',
	'$80,000 to $89,999',
	'$90,000 to $99,999',
	'$100,000 and over',
];

var incomeEdit = [
	'Under $10k',
	'$10k to $20k',
	'$20k to $30k',
	'$30k to $40k',
	'$40k to $50k',
	'$50k to $60k',
	'$60k to $70k',
	'$70k to $80k',
	'$80k to $90k',
	'$90k to $100k',
	'Over $100k',
];

var incomeRemove = [];

var house = [
	'One person household',
	'Two-or-more person non-census-family household',
	'One couple census family with other persons in the household',
	'One couple census family without other persons in the household',
	'One-census-family households with additional persons',
	'One-census-family households without additional persons',
	'One lone-parent census family with other persons in the household',
	'One lone-parent census family without other persons in the household',
];

var houseEdit = [
	'1 Person',
	'2+ People, Non-Family',
	'Couple w/ Others',
	'Couple',
	'Family w/ Others',
	'Family',
	'Single Parent w/ Others',
	'Single Parent',
	'',
];

function nominalOrder(group, input) {
	return group.indexOf(input);
}

// SETTINGS
$(document).on('click', '#national', function() {
	scale = 'country';
	load();
});
$(document).on('click', '#provincial', function() {
	scale = 'province';
	load();
});
$(document).on('click', '#municipal', function() {
	scale = 'name';

	load();
});

$(document).on('click', '.categorySelect', function() {
	var text = $(this).text();
	console.log('text is: ' + text);
	var index = incomeEdit.indexOf(text);
	console.log('index is: ' + index);
	text = income[index];
	console.log('new text is: ' + text);

	if (incomeRemove.indexOf(text) === -1) {
		// add
		incomeRemove.push(text);
		$(this).removeClass('highlight');
	} else {
		// remove
		incomeRemove.splice(incomeRemove.indexOf(text), 1);
		$(this).addClass('highlight');
	}
	console.log('array is: ' + incomeRemove);

	load();
});

var scale = 'name' // 'country', 'province', 'name', 'national', 'provincial', 'municipal'

var selection = ['CAN'];

// if scale is larger than selections, only use selected items for that bin

// BOUNDS
function load() {
	$('svg').remove();
	$('g').remove();

	var margin = {top: 150, right: 50, bottom: 150, left: 50},
		outerWidth = 0.75 * $(window).width(),
		outerHeight = 0.9 * $(window).height(),
		innerWidth = outerWidth - margin.left - margin.right,
		innerHeight = outerHeight - margin.top - margin.bottom;

		rankOuterWidth = outerWidth*3;	
		rankOuterHeight = outerWidth;
		rankInnerWidth = rankOuterWidth - margin.left - margin.right,
		rankInnerHeight = rankOuterHeight - margin.top - margin.bottom;	

	// SCALE
	var xScale = d3.scaleLinear().range([0, innerWidth]);
	var yScale = d3.scaleLinear().range([0, innerHeight]);
	var yScaleFlip = d3.scaleLinear().range([innerHeight, 0]);

	var rankXScale = d3.scaleLinear().range([0, rankInnerWidth]);
	var rankYScale = d3.scaleLinear().range([0, rankInnerHeight]);
	var rankYScaleFlip = d3.scaleLinear().range([rankInnerHeight, 0]);


	var colorScale = d3.scaleSequential(d3.interpolateWarm)
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
		.attr('width', rankOuterWidth)
		.attr('height', rankOuterHeight)
			.append('g')
			.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

	var legendArea = d3.select('#legendArea')
		.append('svg')
		.attr('width', outerWidth)
		.attr('height', outerHeight);

	// Add the X Axis
	lineChart.append('g')
		.attr('class', 'xAxis')
		.attr('transform', 'translate(0,' + innerHeight + ')')
		.call(d3.axisBottom(d3.scalePoint().domain(incomeEdit).range([0, innerWidth])))
		.selectAll("text")
		.attr("font-size", 12)
		.style("text-anchor", "middle")
		.attr('class', 'categorySelect highlight');

	// lineChart.append("text")             
	//       .attr("transform", "translate(" + (margin.left + innerWidth/2) + " ," + (margin.top + innerHeight) + ")")
	//       .style("text-anchor", "middle")
	//       .text("Income Group");

	stackChart.append('g')
		.attr('class', 'xAxis')
		.attr('transform', 'translate(0,' + innerHeight + ')')
		.call(d3.axisBottom(d3.scalePoint().domain(houseEdit).range([0, innerWidth])))
		.selectAll("text")
		.attr("font-size", 12)
		.style("text-anchor", "start");

	// Add the Y Axis
	lineChart.append('g')
		.attr('class', 'yAxis')
		.call(d3.axisLeft(yScaleFlip).ticks(10).tickFormat(function(d) { return d * 100 + '%'; }));

	// lineChart.append("text")
	// 	.attr("y", margin.left)
	// 	.attr("x", outerHeight/2)
	// 	.style("text-anchor", "middle")
	// 	.attr("transform", "rotate(-90)")
	// 	.text("Percent"); 

	stackChart.append('g')
		.attr('class', 'yAxis')
		.attr("font-size", 12)
		.call(d3.axisLeft(yScaleFlip).ticks(10).tickFormat(function(d) { return d * 50 + '%'; }));

	rankChart.append('g')
		.attr('class', 'yAxis')
		.call(d3.axisLeft(rankYScaleFlip).ticks(7).tickFormat(function(d) { return d * 35 + '%'; }));

	var flip = income.slice();
	flip.reverse();

	// legend
	var stackedLegend = legendArea.append("g")
		.attr("font-size", 12)
		.attr("font-family", "sans-serif")
		.attr("text-anchor", "start")
		// to get each individual label column, slice each element in the array 
		// then to show it from highest to lowest, reverse it with the reverse function  
		.selectAll("g")
		.data(flip)
		.enter()
		.append("g")
			.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

	//Legend: Colour - for each colour in z array, create a rectangle to hold colour in
	stackedLegend.append("rect")
		.attr("x", 0)
		.attr("width", 18)
		.attr("height", 18)
		.attr("fill", function (d) { return colorScale(nominalOrder(income, d)) });

	//Legend: Text - after each rectangle, add the column name it is ex. income under $10k
	stackedLegend.append("text")
		.attr("x", 25)
		.attr("y", 9.5)
		.attr("dy", "0.32em")
		.text(function(d) { return d; });

	// DATA

	d3.csv('dataset.csv', function(error, data) {
		// CONVERT
		data.forEach(function(d) {
			d.country = d.country;
			d.province = d.province;
			d.name = d.name;
			d.income = d.income;
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
				// nest by name, then income
				.nest()
				.key(function(d) { return d[column]; })
				.key(function(d) { return d.income; })
				// for each subgroup
				.rollup(function(d) {
					// return a set of calculated values
					var total = d3.sum(d, function(d) { 
						var total = d3.sum([d.tenureOwner, d.tenureRenter, d.tenureBand]);
						return total;
					});
					var over30 = d3.sum(d, function(d) {
						var total = d3.sum([d.tenureOwner, d.tenureRenter, d.tenureBand]);
						if (d.costIncomeRatio == 'Spending 30% or more of income on shelter costs') {
							return total;
						} else {
							return 0;
						}
					});
					var ratio = total !== 0 ? (over30 / total) : 0;

					// as an object
					return {
						'total': total,
						'over30': over30,
						'ratio': ratio,
					};
				})
				// supply dataset
				.entries(data);

			
			// create same variables for first level
			dataNest.forEach(function(d) {
				d['total'] = 0;
				d['over30'] = 0;
				d.values.forEach(function(e) {
					d.total += e.value.total;
					d.over30 += e.value.over30;
				});
				d['ratio'] = d.total !== 0 ? (d.over30 / d.total) : 0;
			});

			// sort first level from high ratio to low
			dataNest.sort(function(x, y) {
				return d3.descending(x.ratio, y.ratio);
			});

			// sort incomes (so line draws in right order)
			dataNest.forEach(function(d) {
				d.values.sort(function(x, y) {
					return d3.ascending(nominalOrder(income, x.key), nominalOrder(income, y.key));
				});
			});	

			return dataNest;
		}

		var dataNest = createSelection(scale, selection);
		var allTotal = 0;
		dataNest.forEach(function(d) {
			allTotal += d.total;
		});

		console.log(dataNest);


		var houseDataNest = createSelection('houseType', selection);
		var houseAllTotal = 0;
		houseDataNest.forEach(function(d) {
			houseAllTotal += d.total;
		});

		houseDataNest.sort(function(x, y) {
			return d3.ascending(nominalOrder(house, x.key), nominalOrder(house, y.key));
		});

		// LINE CHART
		// scale
		// x, income index, min to max
		xScale.domain([
			// min of
			d3.min(dataNest, function(d) { 
				// min of income index
				var n = d3.min(d.values, function(d) {
					return nominalOrder(income, d.key);
				});
				return n; 
			}),
			// to max of
			d3.max(dataNest, function(d) { 
				// max of income index
				var n = d3.max(d.values, function(d) {
					return nominalOrder(income, d.key);
				});
				return n; 
			})
		]);
		// y, ratio, 0 to max
		yScale.domain([0, 
			// max of
			d3.max(dataNest, function(d) { 
				// max of income ratio
				var n = d3.max(d.values, function(d) {
					return d.value.ratio;
				});
				return n; 
			})
		]);

		// define line
		var line = d3.line() 
			.x(function(d) { return xScale(nominalOrder(income, d.key)); })
			.y(function(d) { return yScaleFlip(d.value.ratio); })
			.curve(d3.curveMonotoneX);

		// apply
		dataNest.forEach(function(d, i) { 
			// append an svg <path>
			lineChart.append('path')
				// class='line'
				.attr('class', 'line')
				// ??? add colors dynamically
				.style('stroke', function() { return d.color = '#808080'; })
				// d='val, val, val'
				.attr('d', line(d.values))

				//SUPPOSED TO SHOW CITY NAME WHEN HOVER LINE. Worked on assn5.. not anymore
				// .append('title')
				// .text(function(d) {
				// 	return 'city name' + d.GEO_NAME;
				// };
		});



		// STACK CHART
		xScale.domain([0, houseDataNest.length]);
		yScale.domain([0, .5]);
		yScaleFlip.domain([0, .5]);

		var xOffset = 0;
		houseDataNest.forEach(function(d, i) { 
			// for each group item
			// reset yOffset
			var yOffset = 0;
			d.values.forEach(function (e, j) {

				// for each income group
				// get ratio for yRange
				totalRatio = e.value.over30 / d.total;

				// increment yOffset before (because of rect's top y-origin)
				yOffset += totalRatio;
				
				stackChart.append('rect')
					.attr('class', 'segment')
					.attr('x', xScale(xOffset))
					.attr('y', yScaleFlip(yOffset))
					.attr('width', xScale(1) - 2)
					.attr('height', yScale(totalRatio))
					.style('fill', function() { return colorScale(nominalOrder(income, e.key)) });
			});
			// increment xOffset after (because of rect's left x-origin)
			//xOffset += d.total;
			xOffset += 1;

		});

		// RANK CHART
		rankXScale.domain([0, dataNest.length]);
		rankYScale.domain([0, .35]);
		rankYScaleFlip.domain([0, .35]);

		var xAxisRank = [];
		var xOffset = 0;
		dataNest.forEach(function(d, i) {
			// for each group item
			// reset yOffset
			var yOffset = 0;
			d.values.forEach(function (e, j) {
				// for each income group
				// get ratio for yRange
				totalRatio = e.value.over30 / d.total;

				// increment yOffset before (because of rect's top y-origin)
				yOffset += totalRatio;

				rankChart.append('rect')
					.attr('x', rankXScale(xOffset))
					.attr('y', rankYScaleFlip(yOffset))
					.attr('width', rankXScale(1) - 2)
					.attr('height', rankYScale(totalRatio))
					.style('fill', function() { return colorScale(nominalOrder(income, e.key)) })
					.attr('class', 'segment')
					// .on('mouseover', tip.show)
					// .on('mouseout', tip.hide);
			});

			// increment xOffset after (because of rect's left x-origin)
			//xOffset += d.total;
			xOffset += 1;

			xAxisRank.push(d.key);
		});

		rankChart.append('g')
			.attr('class', 'xAxis')
			.attr('transform', 'translate(0,' + rankInnerHeight + ')')
			.call(d3.axisBottom(d3.scalePoint().domain(xAxisRank).range([0, rankInnerWidth])))
			.selectAll("text")
			.attr("transform", "rotate(-90)")
			.attr("font-size", 12)
			.style("text-anchor", "end");
	});

}