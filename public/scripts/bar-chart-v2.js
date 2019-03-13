function CustomBarChart() {}
CustomBarChart.prototype.create = function() {}

CustomBarChart.prototype.createFrame = function(elementId, chartWidth, chartHeight) {
  this.svg = d3.select("#" + elementId)
              .append("svg")
              .attr("width", chartWidth)
              .attr("height", chartHeight);   
  this.width = this.svg.attr("width") - this.margin.left - this.margin.right,
  this.height = this.svg.attr("height") - this.margin.top - this.margin.bottom,
  this.g = this.svg.append("g").attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
}

CustomBarChart.prototype.xScale = function(width, xScaleData) { 
  var x;
  switch (this.xScaleType) {
    case 'time':
      x = d3.scaleTime().range([0, width]);
      x.domain(xScaleData);//[lowest,highest]
      break;
    case 'linear':
      x = d3.scaleLinear().range([0, width]);
      x.domain(xScaleData);
      break;
    default:
      x = d3.scaleBand().rangeRound([0, width]).padding(0.1);
      x.domain(xScaleData.map(function(d) { return d.type; }));
      break;
  }
  return x;
}

CustomBarChart.prototype.yScale = function() {
  var y;
  y = d3.scaleLinear().rangeRound([this.height, 0]);
  y.domain([0, d3.max(this.data, function(d) { return d.sum; })]);
  return y;
}

CustomBarChart.prototype.yAxisLeft = function(y, ticks) {
  var yAxis = d3.axisLeft(y).tickFormat(d3.format("d"));
  if (ticks > -1 && ticks < 10) {
    yAxis.ticks(ticks);
  }
  return yAxis;
}

CustomBarChart.prototype.xAxisBottom = function(x, ticks, tickFormat) {
  var xAxis = d3.axisBottom(x);
  if (ticks > -1) {
    xAxis.ticks(ticks);
  }
  if (tickFormat === 'time') {
    xAxis.tickFormat(d3.timeFormat("%d %b %Y"));
  }
  return xAxis;
}

CustomBarChart.prototype.getBarWidth = function() {
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

CustomBarChart.prototype.getBarData = function(data) {
  var result;
  if (this.xScaleType === 'time') {
    var parseDate = d3.timeParse("%m/%d/%Y");
    result = this.x(parseDate((data.date.getMonth()+1) +"/"+data.date.getDate()+"/"+data.date.getFullYear()))
  } else {
    result = this.x(data.type);
  }
  if (this.this.xScaleType === 'linear') {
    result+=2;
  }
  return result;
}

CustomBarChart.prototype.xBarPosition = function(x, data, type) {
  var result;
  if (type === 'time') {
    var parseDate = d3.timeParse("%m/%d/%Y");
    result = x(parseDate((data.date.getMonth()+1) +"/"+data.date.getDate()+"/"+data.date.getFullYear()))
  } else {
    result = x(data.type);
  }
  if (type === 'linear') {
    result+=2;
  }
  return result;
}

CustomBarChart.prototype.createYAxis = function(label) {
  this.g.append("g")
    .call(this.yAxis)
    .attr('class', 'y-axis')
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -50)
      .attr("x", -(this.height/2))
      .attr("dy", "0.9em")
      .attr("fill", "#000")
      .text(label);
}

CustomBarChart.prototype.createXAxis = function(label) {
  this.g.append("g")
  .attr("transform", "translate(0," + this.height + ")")
  .style("font-size", this.styles.xBarFontSize)
  .call(this.xAxis)
  .append("text")
    .attr("y", 30)
    .attr("x", this.width/2)
    .attr("fill", "#000")
    .text(label);
}

CustomBarChart.prototype.createTitle = function() {
  this.svg
    .append("g")
    .attr("class", "title")
    .style("font-size", this.styles.titleFontSize)
    .append("text")
      .attr("x", (this.width/1.80))
      .attr("y", 30)
      .attr("text-anchor", "middle")
      .style("font", "sans-serif")
      .text(this.title);
}

CustomBarChart.prototype.createBars = function() {
  var thisObj = this;
  
  // Define the div for the tooltip
  var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  this.bars = this.g.selectAll(".bar")
    .data(this.data)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", function(d) { return thisObj.xBarPosition(thisObj.x,d,thisObj.xScaleType); })
    .attr("y", function(d) { return thisObj.y(d.sum); })
    .attr("width", this.getBarWidth(this.xScaleType))
    .attr("height", function(d) { return (thisObj.height - thisObj.y(d.sum)); });

  if (true) {
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

CustomBarChart.prototype.createBrush = function() {
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

CustomBarChart.prototype.updateYAxis = function() {
  this.y = this.yScale();
  this.yAxis = this.yAxisLeft(this.y, this.yTicks);
  this.g.selectAll(".y-axis").remove();
  
  this.createYAxis();    
}

CustomBarChart.prototype.updateBars = function(data) {
  this.g.selectAll(".bar").remove();

  this.createBars();
}

CustomBarChart.prototype.updateGraph = function(data) {
  this.data = data;
  this.updateYAxis();
  this.updateBars();
}


