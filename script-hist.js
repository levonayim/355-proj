//setting up all variables
// histogram container will be 500 pixels tall by 960 pixels wide
var histogram = d3.select("#histogram"),
    margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = +histogram.attr("width") - margin.left - margin.right,
    height = +histogram.attr("height") - margin.top - margin.bottom,
    
    // g = groups . needed to "append" things to
	histogramGroup = histogram.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

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
d3.csv("table.csv", function(d, i, columns) {
  for (var i = 1, n = columns.length; i < n; ++i) 
    d[columns[i]] = +d[columns[i]];
    return d;
    }, 
    //if something wrong with dataset, output error
    function(error, data) {
      if (error) throw error;

  //Gets columns of under$10k all the way till $100k
  var incomecategory = data.columns.slice(4);

  x.domain(data.map(function(d) { return d.province; }));
  x1.domain(incomecategory).rangeRound([0, x.bandwidth()]);
  y.domain([0, d3.max(data, function(d) { return d3.max(incomecategory, function(key) { return d[key]; }); })]).nice();

//for each data, create a rectangle based on it's numbers
  histogramGroup.append("g")
    .selectAll("g")
    .data(data)
    .enter().append("g")
      .attr("transform", function(d) { return "translate(" + x(d.province) + ",0)"; })
    .selectAll("rect")
    .data(function(d) { return incomecategory.map(function(key) { return {key: key, value: d[key]}; }); })
    .enter().append("rect")
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
  var legend = histogramGroup.append("g")
      .attr("font-size", 10)
      .attr("font-family", "sans-serif")
      .attr("text-anchor", "end")
    // to get each individual label column, slice each element in the array 
    // then to show it from highest to lowest, reverse it with the reverse function  
    .selectAll("g")
    .data(incomecategory.slice().reverse())
    .enter().append("g")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    //Legend: Colour - for each colour in z array, create a rectangle to hold colour in
      legend.append("rect")
          .attr("x", width - 18)
          .attr("width", 18)
          .attr("height", 18)
          .attr("fill", z);

    //Legend: Text - after each rectangle, add the column name it is ex. income under $10k
      legend.append("text")
          .attr("x", width - 24)
          .attr("y", 9.5)
          .attr("dy", "0.32em")
          .text(function(d) { return d; });
});