function BarChart(data, 
  elementId, 
  chartWidth, 
  chartHeight,
  xScaleType,
  xScaleData,
  yScaleType,
  ticksAmount,
  ticksFormat,
  bWidth,
  titleText, 
  xAxisLabel, 
  yAxisLabel, 
  mouseInfo
) {
  this.svg = d3.select("#" + elementId)
              .append("svg")
              .attr("width", chartWidth)
              .attr("height", chartHeight); 
  this.margin = {top: 40, right: 80, bottom: 40, left: 50},
  this.width = this.svg.attr("width") - this.margin.left - this.margin.right,
  this.height = this.svg.attr("height") - this.margin.top - this.margin.bottom,
  this.g = this.svg.append("g").attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
  
  this.data = data;
  this.titleText = titleText;
  this.xAxisLabel = xAxisLabel;
  this.yAxisLabel = yAxisLabel;
  this.mouseInfo = mouseInfo;
  this.xScaleType = xScaleType;
  this.xScaleData = xScaleData;

  this.x = xScale(xScaleType, this.width, xScaleData);
  this.y = yScale(yScaleType, this.height, data);
  
  this.xAxis = xAxisBottom(this.x, ticksAmount, ticksFormat);
  this.yAxis = yAxisLeft(this.y);

  if (bWidth > 0) {
    this.barWidth = bWidth;
  } else if (xScaleType === 'linear') {
    this.barWidth = (this.width-this.margin.right)/ticksAmount;
  } else {
    this.barWidth = this.x;
  }
}

BarChart.prototype.create = function() {
  var x = this.x;
  var y = this.y;
  var height = this.height;
  var xScaleType = this.xScaleType;

  this.g.append("g")
  .attr("transform", "translate(0," + this.height + ")")
  .call(this.xAxis);
  
  this.g.append("g")
  .call(this.yAxis)
  .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -50)
    .attr("x", -(this.height/2))
    .attr("dy", "0.9em")
    .attr("fill", "#000")
    .text(this.yAxisLabel);
    
    this.g.append("g")
    .append("text")
    .attr("y", this.height+35)
    .attr("x", this.width/2)
    .attr("fill", "#000")
    .style("font-size", "12px")
    .text(this.xAxisLabel);
    
    // Define the div for the tooltip
    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
   
    this.bars = this.g.selectAll(".bar")
    .data(this.data)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", function(d) { return xBarData(x,d,xScaleType); })
    .attr("y", function(d) { return y(d.sum); })
      .attr("width", barWidth(this.xScaleType, this.barWidth))
      .attr("height", function(d) { return (height - y(d.sum)); });
    
    if (this.mouseInfo) {
      this.bars.on("mouseover", function(d) {
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
        });
    }

  this.title = this.svg.append("g")
  	.attr("class", "title");
  this.title.append("text")
  	.attr("x", (this.width/1.80))
  	.attr("y", 30)
  	.attr("text-anchor", "middle")
  	.style("font", "20px sans-serif")
  	.text(this.titleText);
}

