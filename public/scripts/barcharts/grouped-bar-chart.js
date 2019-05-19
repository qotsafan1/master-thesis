function GroupedBarChart(data, elementId, chartWidth, chartHeight, margin, title, xScaleData, meanLine, styles) {
    this.data = data;
    this.elementId = elementId;
    this.chartWidth = chartWidth;
    this.chartHeight = chartHeight;
    this.margin = margin;
    this.title = title;
    this.xScaleData = xScaleData;
    this.styles = styles;
    this.xScaleType = 'default';
    this.meanLine = meanLine;
}


GroupedBarChart.prototype = Object.create(new CustomBarChart());

GroupedBarChart.prototype.xScale = function(width, xScaleData) {
    var x;
        x = d3.scaleBand().rangeRound([0, width]).padding(0.1);
        x.domain(xScaleData.map(function(d) { return d.type; }));
    return x;
}

GroupedBarChart.prototype.xScaleSecond = function(keys) {
    var x1 = d3.scaleBand().rangeRound([0, this.x.bandwidth()]);
        x1.domain(keys)
        x1.padding(0.05)
    return x1;
}
  
GroupedBarChart.prototype.yScale = function(xScaleData) {
    var y;
    y = d3.scaleLinear().rangeRound([this.height, 0]);
    y.domain([0, d3.max(this.data, function(d) {
        var highest = 0;
        for (var i in d) {
            if (i === "type") {
                continue;
            }
            if (d[i] > highest) {
                highest = d[i];
            }
        }
        return highest;
    })]);
    return y;
}

GroupedBarChart.prototype.createBars = function(keys, colors) {
    // Define the div for the tooltip
    var div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);
    
    var thisObj = this;
    color = d3.scaleOrdinal().range(colors);
    this.g.append("g")
    .selectAll("g")
    .data(thisObj.data)
    .join("g")
      .attr("transform", d => `translate(${thisObj.x(d["type"])},0)`)
    .selectAll("rect")
    .data(function(d) {
        return keys.map(function(key) {
            return {key, value: d[key]};
        })
    })
    .join("rect")
      .attr("x", function(d) {
            return thisObj.x1(d.key);
      })
      .attr("y", function(d) {
          return thisObj.y(d.value);
      })
      .attr("width", function() {
          return thisObj.x1.bandwidth();
      })
      .attr("height", function(d) {
        return thisObj.y(0) - thisObj.y(d.value);
      })
      .attr("fill", function(d) {
        return color(d.key);
      })
      .on("mouseover", function(d) {
        div.transition()
            .duration(200)
            .style("opacity", .9);
        div.html(d.value)
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
        })
        .on("mouseout", function(d) {
            div.transition()
                .duration(500)
                .style("opacity", 0)
        });
  }

GroupedBarChart.prototype.createLegend = function(colors, keys) {
    var legend = this.svg.selectAll(".legend")
        .data(keys)
        .enter().append("g")
        .attr("class", "legend")        
        .attr("transform", function (d, i) { return "translate(0," + i * 15 + ")"; });

        legend.append("rect")
            .attr("x", this.width+this.margin.left+5)
            .attr("y", 85)
            .attr("width", 10)
            .attr("height", 10)
            .style("fill", function(d, i) {
                return colors[i];
            })
            .style("stroke", "grey");

        legend.append("text")
            .attr("x", this.width+this.margin.left+20)
            .attr("y", 90)
            .attr("dy", ".35em")
            .style("font-size", "12px")
            .text(function (d) { return d; });
}

GroupedBarChart.prototype.changeXaxis = function() {
    this.g.select(".x-axis").remove();
    x = d3.scaleLinear().range([0, this.width]);
    x.domain([0,24]);
    var xAxis = d3.axisBottom(x).ticks(23);
    this.g.append("g")
        .attr("transform", "translate(0 ," + this.height + ")")
        .attr("class", "x-axis")
        .style("font-size", this.styles.xBarFontSize)
        .call(xAxis)
        .append("text")
            .attr("y", 30)
            .attr("x", this.width/2)
            .attr("fill", "#000")
            .text("Hour");
}

GroupedBarChart.prototype.create = function(xLabel,yLabel, yTicks, keys) {
    this.yLabel = yLabel;
    this.yTicks = yTicks;
    this.createFrame(this.elementId, this.chartWidth, this.chartHeight)    
    this.x = this.xScale(this.width, this.xScaleData);
    this.x1 = this.xScaleSecond(keys);
    this.y = this.yScale(this.xScaleData);

    this.xAxis = this.xAxisBottom(this.x, this.xScaleData);
    this.yAxis = this.yAxisLeft(this.y, yTicks);
    this.barWidth  = this.x;

    this.colors = ["#d7191c","#fdae61","#abdda4","#2b83ba", "black"];

    this.createXAxis(xLabel);
    this.createYAxis(yLabel);
    this.createBars(keys, this.colors);
    this.createTitle();
    //this.createMeanLine();
    this.svg.attr("width", (parseInt(this.svg.attr("width"))+100));
    this.createLegend(this.colors, keys)
}
