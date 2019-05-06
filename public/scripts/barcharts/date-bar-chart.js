function DateBarChart(data, elementId, chartWidth, chartHeight, margin, title, xScaleData, meanLine, styles) {
    this.data = data;
    this.elementId = elementId;
    this.chartWidth = chartWidth;
    this.chartHeight = chartHeight;
    this.margin = margin;
    this.title = title;
    this.xScaleData = xScaleData;
    this.styles = styles;
    this.xScaleType = 'time';
    this.brushes = [];
    this.meanLine = meanLine;
}

DateBarChart.prototype = Object.create(new CustomBarChart());

DateBarChart.prototype.create = function(xLabel,yLabel, yTicks) {
    this.yLabel = yLabel;
    this.yTicks = yTicks;
    this.createFrame(this.elementId, this.chartWidth, this.chartHeight)    
    this.x = this.xScale(this.width, this.xScaleData);
    this.y = this.yScale();

    this.xAxis = this.xAxisBottom(this.x, yTicks, 'time');
    this.yAxis = this.yAxisLeft(this.y, -1);
    
    var d1 = new Date(this.xScaleData[0].getTime());
    d1.setUTCHours(0,0,0,0);
    var d2 = new Date(d1.getTime());
    d2.setUTCDate(d1.getUTCDate() + 1);
    var d1Obj = {date: d1};
    var d2Obj = {date: d2};
    var dayWidth = this.xBarPosition(this.x,d2Obj,this.xScaleType) - this.xBarPosition(this.x,d1Obj,this.xScaleType);
    this.barWidth = dayWidth - (dayWidth < 2.5 ? 0 :0.5);

    this.createXAxis(xLabel);
    this.createYAxis(yLabel);
    //this.createBars();
    //this.createColorBarChart();
    this.createTitle();
    this.createMeanLine();
    this.createDayTicks();    
}

DateBarChart.prototype.updateToSpecificTime = function(type, time) {
    this.removeWeekdayBrushes();
    
    if (type === 'month') {
        var monthIndex = month.indexOf(time); 
        var year = this.xScaleData[0].getUTCFullYear();
        var firstInMonth = new Date(Date.UTC(year, monthIndex, 1));
        var lastInMonth = new Date(Date.UTC(year, monthIndex+1, 0));
        
        if (this.xScaleData[0].getTime() > firstInMonth.getTime()
            || this.xScaleData[1].getTime() < firstInMonth.getTime())
        {
            firstInMonth = new Date(Date.UTC(year+1, monthIndex, 1));
            lastInMonth = new Date(Date.UTC(year+1, monthIndex+1, 0));
        }
        lastInMonth.setUTCHours(23,59,59);

        this.g.call(this.brush.move, [this.x(firstInMonth), this.x(lastInMonth)]);
    } else if (type === 'weekday') {
        this.g.call(this.brush.move, [this.width-1,this.width]);
        var weekdayIndex = weekday.indexOf(time);
        var days = getSpecificWeekdayData(weekdayIndex);        
        for (var i in days) {
            var beginOfDay = this.getBeginningOfDay(days[i]);
            var endOfDay = this.getEndOfDay(days[i]);            
            this.newWeekdayBrush(beginOfDay, endOfDay);
        }
        updateChildGraphsWithWeekdayData(weekdayIndex);
    } else if ('week') {
        if (time in data["daysInEachWeek"]) {
            data["daysInEachWeek"][time]["lastDay"].setUTCHours(23,59,59);
            this.g.call(this.brush.move, [this.x(data["daysInEachWeek"][time]["firstDay"]), this.x(data["daysInEachWeek"][time]["lastDay"])]);
        }
    }
}

DateBarChart.prototype.newWeekdayBrush = function(beginOfDay, endOfDay) {
    var brush = d3.brushX()
        .extent([[0, 0], [this.width, this.height]]);
    var thisObj = this;
    var newG = this.g.append("g")
                     .attr("class", "weekday-brush")
                     .on('mousedown', function() {
                        thisObj.removeWeekdayBrushes();
                     });
    newG.call(brush);
    newG.call(brush.move, [this.x(beginOfDay), this.x(endOfDay)]);
}

DateBarChart.prototype.getBeginningOfDay = function(day) {
    var beginOfDay = new Date(day.getTime());
    beginOfDay.setUTCHours(0,0,0,0);
    return beginOfDay;
}

DateBarChart.prototype.getEndOfDay = function(day) {
    var endOfDay = new Date(day.getTime());
    endOfDay.setUTCHours(23,59,59);
    return endOfDay;
}

DateBarChart.prototype.removeWeekdayBrushes = function() {
    this.g.selectAll('.weekday-brush').remove();
}

DateBarChart.prototype.createColorBarChart = function() {    
    var thisObj = this;
    var colors = ["#0000ff","#FF0000","#FFA500","#008000"];

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
        .attr("height", function(d) { return (thisObj.height - thisObj.y(d.sum)); })
        .style("fill", function(d,i) {
            var dayString = (d.date.getUTCFullYear() +"-"+ (d.date.getUTCMonth()+1) +"-"+ d.date.getUTCDate());
            if (dayString in data["sumStackedHoursEachDay"]) {
                return colors[indexOfMax(data["sumStackedHoursEachDay"][dayString])];
            }
        });
}

DateBarChart.prototype.createStackedBars = function() {
    this.keys = ["00:00-06:00", "06:00-12:00", "12:00-18:00", "18:00-00:00"];
    stack = d3.stack().keys(this.keys);
    series = stack(data["stackedHoursEachDay"]);
    thisObj = this;

    this.colors = ["#0000ff","#FF0000","#FFA500","#008000"];
    var colorScale = d3.scaleOrdinal()
        .range(this.colors);

    this.bars = this.g.selectAll(".bar")
        .data(series)
        .enter()
        .append("g")
        .attr("class", "bar")
        .style("fill", function(d, i) {
            return colorScale(i);
        });

    var rects = this.bars.selectAll("rect")
        .data(function(d) {return d;})
        .enter()
        .append("rect")
            .attr("x", function(d,i) { 
                return thisObj.xBarPosition(thisObj.x,d["data"],thisObj.xScaleType); 
            })
            .attr("y", function(d,i) {
                return thisObj.y(d[1]); })
            .attr("width", this.getBarWidth(this.xScaleType))
            .attr("height", function(d) { 
                return (thisObj.y(d[0]) - thisObj.y(d[1])); 
            });
}

DateBarChart.prototype.createLegend = function() {
    var colors = ["#0000ff","#FF0000","#FFA500","#008000"];
    var keys = ["00-06", "06-12", "12-18", "18-00"];
    var legend = this.svg.selectAll(".legend")
        .data(keys)
        .enter().append("g")
        .attr("class", "legend")        
        .attr("transform", function (d, i) { return "translate(0," + i * 15 + ")"; });

        legend.append("rect")
            .attr("x", this.width+this.margin.left+5)
            .attr("y", 15)
            .attr("width", 10)
            .attr("height", 10)
            .style("fill", function(d, i) {
                return colors[i];
            })
            .style("stroke", "grey");

        legend.append("text")
            .attr("x", this.width+this.margin.left+20)
            .attr("y", 20)
            .attr("dy", ".35em")
            .style("font-size", "12px")
            .text(function (d) { return d; });
}

DateBarChart.prototype.createDayTicks = function() {
    var smallAxis = d3.axisBottom(this.x)
        .ticks(d3.timeDay.every(1))
        .tickSize(4);

    var u = this.g.append("g")
        .attr("transform", "translate(0 ," + this.height + ")")
        .attr("class", "x-axis-small")
        .style("opacity", "0.4")
        .call(smallAxis)
    u.selectAll("text").remove();
}

DateBarChart.prototype.addStackSwitch = function(turnOn) {
    var thisObj = this;
    var checked = turnOn ? "checked" : "";
    this.svg.append("foreignObject")
        .attr("width", 200)
        .attr("height", 100)
        .append("xhtml:body")
        .html(("<form><span class='stacked-label'>Show hour breakdown</span><input type=checkbox id=stackBars "+ checked +" /></form>"))
        .on("click", function(d, i){
            thisObj.deleteBars();
            if (thisObj.svg.select("#stackBars").node().checked) {
                thisObj.createStackedBars();
                thisObj.createLegend();
            } else {
                thisObj.removeLegend();
                thisObj.createBars();
            }
        });
}

DateBarChart.prototype.deleteBars = function() {
    this.g.selectAll(".bar").remove();
}

DateBarChart.prototype.removeLegend = function() {
    this.svg.selectAll(".legend").remove();
}

