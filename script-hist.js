//setting up all variables
// histogram container will be 500 pixels tall by 960 pixels wide
var histogram = d3.select("#histogram"),
    margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = +histogram.attr("width") - margin.left - margin.right,
    height = +histogram.attr("height") - margin.top - margin.bottom,
    
    // g = groups . needed to "append" things to
	histogramGroup = histogram.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var stacked = d3.select("#stacked-bar"),
	margin = {top: 20, right: 20, bottom: 30, left: 40},
	width = +stacked.attr("width") - margin.left - margin.right,
	height = +stacked.attr("height") - margin.top - margin.bottom,

	// g = groups . needed to "append" things to
	stackedGroup = stacked.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//setting variable for the a-axis (provinces)
var x = d3.scaleBand()
  //range goes from 0 to the width of the canvas
    .rangeRound([0, width])
    .paddingInner(0.05)
    .align(0.1);

//sets for each inidivual bar for the income group
var x1 = d3.scaleBand()
    .padding(0.05);

var y = d3.scaleLinear()
    .rangeRound([height, 0]);

//variable to hold all colours for each category
var z = d3.scaleOrdinal()
    .range(["#76AAE4", "#B2DCD3", "#E4E5C6", "#36A9F2", "#0046F9", "#9241FC", "#B393F3", "#D41B86", "#F853E6", "#F47465", "#C92629"]);

//IMPORTING DATA
d3.csv("table.csv",
	function(d, i, columns) {
		//start with 'Under $10,000' and since it's the 5th column, i = 4. t is the variable to count the total number of stacks it'll have. +d[columns[i]] converts it to string array
		for (var i = 4, n = columns.length; i < n; ++i) {
			d[columns[i]] = +d[columns[i]];
		}
		return d;
	}, 
    //if something wrong with dataset, output error
    function(error, data) {
		if (error) { throw error; }

		// gets array of columns from under$10k to $100k+
		var incomeCategory = data.columns.slice(4);

		x.domain(data.map(function(d) { return d.province; }));
		x1.domain(incomeCategory).rangeRound([0, x.bandwidth()]);
		y.domain([0, d3.max(data, function(d) { return d3.max(incomeCategory, function(key) { return d[key]; }); })]).nice();

		//for each data, create a rectangle based on it's numbers
		histogramGroup.append("g")
			.selectAll("g")
			.data(data)
			.enter()
			.append("g")
				.attr("transform", function(d) { return "translate(" + x(d.province) + ",0)"; })
				.selectAll("rect")
				.data(function(d) { return incomeCategory.map(function(key) { return {key: key, value: d[key]}; }); })
				.enter()
				.append("rect")
					.attr("x", function(d) { return x1(d.key); })
					.attr("y", function(d) { return y(d.value); })
					.attr("width", x1.bandwidth())
					.attr("height", function(d) { return height - y(d.value); })
					.attr("fill", function(d) { return z(d.key); });

		//AXIS
		//x-axis
		histogramGroup.append("g")
			.attr("class", "axis")
			.attr("transform", "translate(0," + height + ")")
			.call(d3.axisBottom(x));

		//y-axis
		histogramGroup.append("g")
			.attr("class", "yaxis")
			.call(d3.axisLeft(y).ticks(null, "s"))
			.append("text")
				.attr("x", 2)
				.attr("y", y(y.ticks().pop()) + 0.5)
				.attr("dy", "0.32em")
				.attr("fill", "black")
				.attr("font-weight", "bold")
				.attr("text-anchor", "start")
				.text("Population");

		//SECTION TO CREATE LEGEND OF COLOUR
		//general attributes for the legend on text styling
		var histogramLegend = histogramGroup.append("g")
			.attr("font-size", 10)
			.attr("font-family", "sans-serif")
			.attr("text-anchor", "end")
			// to get each individual label column, slice each element in the array 
			// then to show it from highest to lowest, reverse it with the reverse function  
			.selectAll("g")
			.data(incomeCategory.slice().reverse())
			.enter()
			.append("g")
				.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

		//Legend: Colour - for each colour in z array, create a rectangle to hold colour in
		histogramLegend.append("rect")
			.attr("x", width - 18)
			.attr("width", 18)
			.attr("height", 18)
			.attr("fill", z);

		//Legend: Text - after each rectangle, add the column name it is ex. income under $10k
		histogramLegend.append("text")
			.attr("x", width - 24)
			.attr("y", 9.5)
			.attr("dy", "0.32em")
			.text(function(d) { return d; });
});



d3.csv("table.csv",
	function(d, i, columns) {
		// brings in the actual data/numbers from the columns
		//start with 'Under $10,000' and since it's the 5th column, i = 4.
		//t is the variable to count the total number of stacks it'll have.
		//t is add through the loop for each column of data, +d[columns[i]] converts it to string array
		for (i = 4, t = 0; i < columns.length; ++i) {
			t += d[columns[i]] = +d[columns[i]];
			d.total = t;
		}
		return d;	
	},

	
	function(error, data) {
		//if something wrong with dataset, output error
  		if (error) { throw error; }

		// to get each individual label column, 
		//slice each element in the array starting at the 2nd element
		var incomeCategory = data.columns.slice(4);

		//sorts it from largest to smallest
		data.sort(function(a, b) { return b.total - a.total; });

		x.domain(data.map(function(d) { return d.province; }));
		y.domain([0, d3.max(data, function(d) { return d.total; })]).nice();
		z.domain(incomeCategory);
 
		//for each data, create a rectangle based on it's numbers
		stackedGroup.append("g")
			.selectAll("g")
			.data(d3.stack().keys(incomeCategory)(data))
			.enter()
			.append("g")
				.attr("fill", function(d) { return z(d.key); })
				.selectAll("rect")
				.data(function(d) { return d; })
				.enter()
					.append("rect")
					.attr("x", function(d) { return x(d.data.province); })
					.attr("y", function(d) { return y(d[1]); })
					.attr("height", function(d) { return y(d[0]) - y(d[1]); })
					.attr("width", x.bandwidth());

		//AXIS
		//x-axis
		stackedGroup.append("g")
			.attr("class", "axis")
			.attr("transform", "translate(0," + height + ")")
			.call(d3.axisBottom(x));

		//y-axis
		stackedGroup.append("g")
		.attr("class", "yaxis")
		.call(d3.axisLeft(y).ticks(null, "s"))
		.append("text")
			.attr("x", 2)
			.attr("y", y(y.ticks().pop()) + 0.5)
			.attr("dy", "0.32em")
			.attr("fill", "black")
			.attr("font-weight", "bold")
			.attr("text-anchor", "start")
			.text("Population");

		//SECTION TO CREATE LEGEND OF COLOUR
		//general attributes for the legend on text styling
		var stackedLegend = stackedGroup.append("g")
			.attr("font-size", 10)
			.attr("font-family", "sans-serif")
			.attr("text-anchor", "end")
			// to get each individual label column, slice each element in the array 
			// then to show it from highest to lowest, reverse it with the reverse function  
			.selectAll("g")
			.data(incomeCategory.slice().reverse())
			.enter()
			.append("g")
				.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

		//Legend: Colour - for each colour in z array, create a rectangle to hold colour in
		stackedLegend.append("rect")
			.attr("x", width - 18)
			.attr("width", 18)
			.attr("height", 18)
			.attr("fill", z);

		//Legend: Text - after each rectangle, add the column name it is ex. income under $10k
		stackedLegend.append("text")
			.attr("x", width - 24)
			.attr("y", 9.5)
			.attr("dy", "0.32em")
			.text(function(d) { return d; });
});



// old line graph stuff

/*
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

// BOUNDS
var margin = {top: 30, right: 50, bottom: 50, left: 70},
	outerWidth = 550,
	outerHeight = 550,
	innerWidth = outerWidth - margin.left - margin.right,
	innerHeight = outerHeight - margin.top - margin.bottom;

// SCALE
var x = d3.scale.linear().range([0, innerWidth]);
var y = d3.scale.linear().range([innerHeight, 0]);

// AXIS
var xAxis = d3.svg.axis().scale(x).orient('bottom').ticks(5);
var yAxis = d3.svg.axis().scale(y).orient('left').ticks(5);

var color = d3.scale.category20();   // set the colour scale

// ADD CHART (cannot be named svg or else would over lap it)
var lineChart = d3.select('#area1')
	.append('svg')
	.attr('width', outerWidth)
	.attr('height', outerHeight)
		.append('g')
		.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

// Add the X Axis
lineChart.append('g')
	.attr('class', 'x axis')
	.attr('transform', 'translate(0,' + outerHeight + ')')
	.call(xAxis);

// Add the Y Axis
lineChart.append('g')
	.attr('class', 'y axis')
	.call(yAxis);


d3.csv('table.csv', function(error, data) {
	data.forEach(function(d) {
		// CONVERT
		d.name = d.name;
		d.incomeGroup = d.incomeGroup;
		d.houseType = d.houseType;
		d.costIncomeRatio = d.costIncomeRatio;
		// converts to number or 0
		d.tenureOwner = +d.tenureOwner || 0;
		d.tenureRenter = +d.tenureRenter || 0;
		d.tenureBand = +d.tenureBand || 0;
	});

	// MAKE NESTED DATA
	var dataNest = d3
		// nest by name, then incomeGroup
		.nest()
		.key(function(d) { return d.name; })
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
			var ratio = under30 / total;
			var percent = ratio * 100;

			// as an object
			return {
				total: total,
				under30: under30,
				ratio: ratio,
				percent: percent,
			};
		})
		// supply dataset
		.entries(data);
	
	// sort incomeGroups (so line draws in right order)
	dataNest.forEach(function(d) {
		d.values.sort(function(x, y) {
			return d3.ascending(iGToInt(x.key), iGToInt(y.key));
		});
	});

	// SCALE
	// x, incomeGroup index, min to max
	x.domain([
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
	y.domain([0, 
		// max of
		d3.max(dataNest, function(d) { 
			// max of incomeGroup percent
			var n = d3.max(d.values, function(d) {
				return d.values.percent;
			});
			return n; 
		})
	]);

	// define line
	var line = d3.svg.line() 
		.x(function(d) { return x(iGToInt(d.key)); })
		.y(function(d) { return y(d.values.percent); });

	// for each entry
	dataNest.forEach(function(d,i) { 
		// append an svg <path>
		lineChart.append('path')
			// class='line'
			.attr('class', 'line')
			// ??? add colors dynamically
			.style('stroke', function() { return d.color = color(d.key); })
			// d='val, val, val'
			.attr('d', line(d.values));
	});

	//HOVER OVER LINE. SHOW INFO. At the moment shows the 'highest' point of all the points for that city.. need to figure out how to show just the points.
	lineChart.selectAll('path')
		.data(data)
		.append('title')
		.text(function(d) {
			return d.tenure + ' tenure ' + d.fraction + ' fraction' + d.income + ' income range' + d.GEO_NAME;
		});
});
*/