function TimeAxisChart(data, elementId, titleText, xAxisLabel, yAxisLabel) {
  var svg = d3.select("#" + elementId)
              .append("svg")
              .attr("width", 900)
              .attr("height", 250);
  var margin = {top: 40, right: 80, bottom: 40, left: 50},
  	width = svg.attr("width") - margin.left - margin.right,
  	height = svg.attr("height") - margin.top - margin.bottom,
  	g = svg.append("g").attr("transform", "translate(" + margin.left + "," +margin.top + ")");

  var x = xScale('time', width, [new Date("Sep 1, 2016"), new Date("January 1, 2017")]);
  var y = yScale('default', height, data);
  var xAxis = xAxisBottom(x, 5, 'time');
  var yAxis = yAxisLeft(y);
console.log(x)
  g.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);
    
  g.append("g")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -50)
    .attr("x", -(height/2))
    .attr("dy", "0.9em")
    .attr("fill", "#000")
    .text(yAxisLabel);
    
  // Define the div for the tooltip
  var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);
      
  g.append("g")
    .append("text")
    .attr("y", height+35)
    .attr("x", width/2)
    .attr("fill", "#000")
    .style("font-size", "12px")
    .text(xAxisLabel);

console.log(data)
  g.selectAll(".bar")
    .data(data)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d, i) {
        return xBarData(x,d,false,'time');
      })
      .attr("y", function(d) { return y(d.sum); })
      .attr("width", barWidth('time', 3))
      .attr("height", function(d) { return height - y(d.sum); });

  var title = svg.append("g")
  	.attr("class", "title");
  title.append("text")
  	.attr("x", (width/1.80))
  	.attr("y", 30)
  	.attr("text-anchor", "middle")
  	.style("font", "20px sans-serif")
  	.text(titleText);
}
