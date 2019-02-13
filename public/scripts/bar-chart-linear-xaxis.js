function BarChartLinearAxis(data, elementId, titleText, xAxisLabel, yAxisLabel) {
  var svg = d3.select("#" + elementId)
              .append("svg")
              .attr("width", 900)
              .attr("height", 250);
  var margin = {top: 40, right: 80, bottom: 40, left: 50},
  	width = svg.attr("width") - margin.left - margin.right,
  	height = svg.attr("height") - margin.top - margin.bottom,
  	g = svg.append("g").attr("transform", "translate(" + margin.left + "," +margin.top + ")");

  var x = xScale('linear', width, [0,24]);
  var y = yScale('default', height, data);
  var xAxis = xAxisBottom(x, 24);
  var yAxis = yAxisLeft(y);

  g.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

  // Define the div for the tooltip
  var div = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("opacity", 0);


  g.append("g")
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -50)
    .attr("x", -(height/2))
    .attr("dy", "0.9em")
    .attr("fill", "#000")
    .text(yAxisLabel);

  g.append("g")
    .append("text")
    .attr("y", height+35)
    .attr("x", width/2)
    .attr("fill", "#000")
    .style("font-size", "12px")
    .text(xAxisLabel);


  g.selectAll(".bar")
    .data(data)
    .enter().append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return xBarData(x,d,'linear');})
      .attr("y", function(d) { return y(d.sum); })
      .attr("width", barWidth('linear', (width-80)/24))
      .attr("height", function(d) { return height - y(d.sum); })
      .on("mouseover", function(d) {
            div.transition()
                .duration(200)
                .style("opacity", .9);
            div.html(d.sum)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY - 28) + "px");
            })
        .on("mouseout", function(d) {
            div.transition()
                .duration(500)
                .style("opacity", 0)
        });;

  var title = svg.append("g")
  	.attr("class", "title");
  title.append("text")
  	.attr("x", (width/1.80))
  	.attr("y", 30)
  	.attr("text-anchor", "middle")
  	.style("font", "20px sans-serif")
  	.text(titleText);
}
