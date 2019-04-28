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
    this.barWidth = 3;

    this.createXAxis(xLabel);
    this.createYAxis(yLabel);
    //this.createBars();
    //this.createColorBarChart();
    this.createTitle();
    this.createMeanLine();
}

DateBarChart.prototype.updateToSpecificTime = function(type, time) {
    this.removeWeekdayBrushes();
    
    if (type === 'month') {
        var monthIndex = month.indexOf(time); 
        var year = this.xScaleData[0].getFullYear();
        var firstInMonth = new Date(year, monthIndex, 1)
        var lastInMonth = new Date(year, monthIndex+1, 0)
        
        if (this.xScaleData[0].getTime() > firstInMonth.getTime()
            || this.xScaleData[1].getTime() < firstInMonth.getTime())
        {
            firstInMonth = new Date(year+1, monthIndex, 1)
            lastInMonth = new Date(year+1, monthIndex+1, 0)
        }
        lastInMonth.setHours(23,59,59);

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
            data["daysInEachWeek"][time]["lastDay"].setHours(23,59,59);
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
    var beginOfDay = new Date(day);
    beginOfDay.setHours(0,0,0,0);
    return beginOfDay;
}

DateBarChart.prototype.getEndOfDay = function(day) {
    var endOfDay = new Date(day);
    endOfDay.setHours(23,59,59);
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
            var dayString = (d.date.getFullYear() +"-"+ (d.date.getMonth()+1) +"-"+ d.date.getDate());
            if (dayString in data["sumStackedHoursEachDay"]) {
                return colors[indexOfMax(data["sumStackedHoursEachDay"][dayString])];
            }
        });
}

