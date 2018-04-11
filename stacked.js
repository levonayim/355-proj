//setting up all variables
// SVG container will be 500 pixels tall by 960 pixels wide
var svg = d3.select("svg"),
    margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    
    // g = groups . needed to "append" things to
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//setting variable for the a-axis (provinces)
var x = d3.scaleBand()
    .rangeRound([0, width])
    .paddingInner(0.05)
    .align(0.1);

var y = d3.scaleLinear()
    .rangeRound([height, 0]);

//variable to hold all colours for each category
var z = d3.scaleOrdinal()
    .range(["#76AAE4", "#B2DCD3", "#E4E5C6", "#36A9F2", "#0046F9", "#9241FC", "#B393F3", "#D41B86", "#F853E6", "#F47465", "#C92629"]);


d3.csv("table.csv", function(d, i, columns) {
  for (i = 4, t = 0; i < columns.length; ++i) 
    t += d[columns[i]] = +d[columns[i]];
  d.total = t;
  return d;
}, 

//if something wrong with dataset, output error
function(error, data) {
  if (error) throw error;
  
  // to get each individual label column, 
  //slice each element in the array starting at the 2nd element
  var incomecategory = data.columns.slice(1);
  
///////sorts it from largest to smallest
  data.sort(function(a, b) { return b.total - a.total; });
  
  x.domain(data.map(function(d) { return d.province; }));
  y.domain([0, d3.max(data, function(d) { return d.total; })]).nice();
  z.domain(incomecategory);
  
  g.append("g")
    .selectAll("g")
    .data(d3.stack().keys(incomecategory)(data))
    .enter().append("g")
      .attr("fill", function(d) { return z(d.key); })
    .selectAll("rect")
    .data(function(d) { return d; })
    .enter().append("rect")
      .attr("x", function(d) { return x(d.data.province); })
      .attr("y", function(d) { return y(d[1]); })
      .attr("height", function(d) { return y(d[0]) - y(d[1]); })
      .attr("width", x.bandwidth());
  
//AXIS
//x-axis
  g.append("g")
      .attr("class", "axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

//y-axis
  g.append("g")
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
  var legend = g.append("g")
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
          .attr("x", width - 20)
          .attr("width", 20)
          .attr("height", 20)
          .attr("fill", z);

    //Legend: Text - after each rectangle, add the column name it is ex. income under $10k
      legend.append("text")
          .attr("x", width - 24)
          .attr("y", 9.5)
          .attr("dy", "0.32em")
          .text(function(d) { return d; });
});