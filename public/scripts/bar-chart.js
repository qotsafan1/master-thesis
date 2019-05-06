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
  mouseInfo,
  brush
) {
  this.svg = d3.select("#" + elementId)
              .append("svg")
              .attr("width", chartWidth)
              .attr("height", chartHeight); 
  this.margin = {top: 40, right: 80, bottom: 40, left: 50},
  this.width = this.svg.attr("width") - this.margin.left - this.margin.right,
  this.height = this.svg.attr("height") - this.margin.top - this.margin.bottom,
  this.g = this.svg.append("g").attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
  
  this.data       = data;
  this.titleText  = titleText;
  this.xAxisLabel = xAxisLabel;
  this.yAxisLabel = yAxisLabel;
  this.mouseInfo  = mouseInfo;
  this.xScaleType = xScaleType;
  this.xScaleData = xScaleData;
  this.yScaleType = yScaleType;
  this.brush      = brush;

  this.x = this.xScale(xScaleType, this.width, xScaleData);
  this.y = this.yScale();
  
  this.xAxis = this.xAxisBottom(ticksAmount, ticksFormat);
  this.yAxis = this.yAxisLeft();

  this.barWidth  = this.calculateBarWidth(bWidth, ticksAmount);
}

BarChart.prototype.xScale = function() { 
  var x;
  switch (this.xScaleType) {
    case 'time':
      x = d3.scaleUtc().range([0, this.width]);
      x.domain(this.xScaleData);//[lowest,highest]
      break;
    case 'linear':
      x = d3.scaleLinear().range([0, this.width]);
      x.domain(this.xScaleData);
      break;
    default:
      x = d3.scaleBand().rangeRound([0, this.width]).padding(0.1);
      x.domain(this.xScaleData.map(function(d) { return d.type; }));
      break;
  }
  return x;
}

BarChart.prototype.yScale = function(height, data) {
  var y;
  y = d3.scaleLinear().rangeRound([this.height, 0]);
  y.domain([0, d3.max(this.data, function(d) { return d.sum; })]);
  return y;
}

BarChart.prototype.yAxisLeft = function() {
  var yAxis = d3.axisLeft(this.y);
  return yAxis;
}

BarChart.prototype.xAxisBottom = function(ticks, tickFormat) {
  var xAxis = d3.axisBottom(this.x);
  if (ticks > -1) {
    xAxis.ticks(ticks);
  }
  if (tickFormat === 'time') {
    xAxis.tickFormat(d3.timeFormat("%d %b %Y"));
  }
  return xAxis;
}

BarChart.prototype.calculateBarWidth = function(width, ticksAmount) {
  if (width > 0) {
    return width;
  } else if (this.xScaleType === 'linear') {
    return (this.width-this.margin.right)/ticksAmount;
  } else {
    return this.x;
  }
}

BarChart.prototype.getBarWidth = function() {
  var width;
  switch (this.xScaleType) {
    case 'time':
      width = this.barWidth;
      break;
    case 'linear':
      width = this.barWidth;
      break;
    default:
      width = this.barWidth.bandwidth();
      break;
  }
  return width;
}

BarChart.prototype.getBarData = function(data) {
  var result;
  if (this.xScaleType === 'time') {
    var parseDate = d3.timeParse("%m/%d/%Y");
    result = this.x(parseDate((data.date.getUTCMonth()+1) +"/"+data.date.getUTCDate()+"/"+data.date.getUTCFullYear()))
  } else {
    result = this.x(data.type);
  }
  if (this.xScaleType === 'linear') {
    result+=2;
  }
  return result;
}

BarChart.prototype.xBarPosition = function(x, data, type) {
  var result;
  if (type === 'time') {
    var parseDate = d3.timeParse("%m/%d/%Y");
    result = x(parseDate((data.date.getUTCMonth()+1) +"/"+data.date.getUTCDate()+"/"+data.date.getUTCFullYear()))
  } else {
    result = x(data.type);
  }
  if (type === 'linear') {
    result+=2;
  }
  return result;
}

BarChart.prototype.createYAxis = function() {
  this.g.append("g")
    .call(this.yAxis)
    .attr('class', 'y-axis')
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -50)
      .attr("x", -(this.height/2))
      .attr("dy", "0.9em")
      .attr("fill", "#000")
      .text(this.yAxisLabel);
}

BarChart.prototype.createXAxis = function() {
  this.g.append("g")
  .attr("transform", "translate(0," + this.height + ")")
  .call(this.xAxis)
  .append("text")
    .attr("y", 30)
    .attr("x", this.width/2)
    .attr("fill", "#000")
    .style("font-size", "12px")
    .text(this.xAxisLabel);
}

BarChart.prototype.createTitle = function() {
  this.title = this.svg.append("g")
  	.attr("class", "title");
  this.title.append("text")
  	.attr("x", (this.width/1.80))
  	.attr("y", 30)
  	.attr("text-anchor", "middle")
  	.style("font", "20px sans-serif")
    .text(this.titleText);
}

BarChart.prototype.createBars = function() {
  var x = this.x;
  var y = this.y;
  var height = this.height;
  var xScaleType = this.xScaleType;
  var xBarPosition = this.xBarPosition;
  
  // Define the div for the tooltip
  var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  this.bars = this.g.selectAll(".bar")
    .data(this.data)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", function(d) { return xBarPosition(x,d,xScaleType); })
    .attr("y", function(d) { return y(d.sum); })
    .attr("width", this.getBarWidth())
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
}

BarChart.prototype.createBrush = function() {
  var x = this.x;
  var brush = d3.brushX()
    .extent([[0, 0], [this.width, this.height]])
    .on("start brush", brushed);

    this.g.call(brush);
    //this.g.call(brush.move, [0, this.width]);
    
    function brushed() {
      var extent = d3.event.selection.map(x.invert, x);
      
      updateChildGraphs(extent[0], extent[1]);
    }
}


BarChart.prototype.create = function() {
  var x = this.x;
  this.createXAxis();
  
  this.createYAxis();
    
  this.createBars();

  this.createTitle();

  if (this.brush) {
    this.createBrush();
  }
}

BarChart.prototype.updateYAxis = function() {
  this.y = this.yScale(this.yScaleType, this.height, this.data);
  this.yAxis = this.yAxisLeft(this.y);
  this.g.selectAll(".y-axis").remove();
  
  this.createYAxis();    
}

BarChart.prototype.updateBars = function(data) {
  this.g.selectAll(".bar").remove();

  this.createBars();
}

BarChart.prototype.updateGraph = function(data) {
  this.data = data;
  this.updateYAxis();
  this.updateBars();
}


