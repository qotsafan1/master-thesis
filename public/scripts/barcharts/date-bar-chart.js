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
    this.createTitle();
    this.createMeanLine();
    this.createDayTicks();
    this.addFirstAndLastTicks();
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

DateBarChart.prototype.createStackedBars = function(hourChunks) {
    var keys = ["00-06", "06-12", "12-18", "18-00"];
    var barData = data["stackedHoursEachDay"][2]
    //var colors = ["#0000ff","#FF0000","#FFA500","#008000"];
    var colors = ["black","#abdda4","#fdae61","#2b83ba"];

    if (hourChunks === 3) {
        keys = ["00-04", "04-08", "08-12", "12-16", "16-20", "20-00"];
        colors = ["black","#99d594","#e6f598","#fee08b","#fc8d59","#3288bd"];
        barData = data["stackedHoursEachDay"][3];
    } else if (hourChunks === 1) {
        keys = ["00-09", "09-18", "18-00"];
        colors = ["black","#fdae61","#2b83ba"];
        barData = data["stackedHoursEachDay"][1];
    } else if (hourChunks === 0) {
        keys = ["00-12", "12-00"];
        colors = ["#2b83ba","#fdae61"];
        barData = data["stackedHoursEachDay"][0];
    } else if (hourChunks === 4) {
        keys = ["00-03", "03-06", "06-09", "09-12", "12-15","15-18", "18-21","21-24"];
        colors = ["black","#878787","#fddbc7","#abdda4","#e6f598","#fee08b","#92c5de","#2166ac"];
        barData = data["stackedHoursEachDay"][4];
    }
    stack = d3.stack().keys(keys);
    series = stack(barData);
    thisObj = this;

    var colorScale = d3.scaleOrdinal()
        .range(colors);

    this.bars = this.g.selectAll(".bar")
        .data(series)
        .enter()
        .append("g")
        .attr("class", "bar")
        .style("fill", function(d, i) {
            return colorScale(i);
        });

    this.bars.selectAll("rect")
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

    this.createLegend(colors, keys)
}

DateBarChart.prototype.createLegend = function(colors, keys) {
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
    
    var form = this.svg.append("foreignObject")
        .attr("width", 400)
        .attr("height", 40)
        .append("xhtml:body")
        .html("<span class='stacked-label'>Show hour breakdown</span>");

    form.append("input")
        .attr("type", "checkbox")
        .attr("id", "stackBars")
        .attr("class", "stacked-checkbox")
        .property("checked", turnOn)
        .on("click", function(d, i){
            thisObj.deleteBars();
            thisObj.removeLegend();
            if (thisObj.svg.select("#stackBars").node().checked) {                
                thisObj.createStackedBars(parseInt(document.getElementById("chunkSelect").value));
                thisObj.changeChunkSelect(true);
            } else {
                thisObj.createBars();
                thisObj.changeChunkSelect(false);
            }
        });
    form.append("span").
        attr("class", "stacked-label stacked-chunks")
        .style("display", function() {
            if (turnOn) {
                return "";
            }
            return "none";
        })
        .text("Division of day: ");
    
    var chunck = ["2", "3", "4", "6", "8"];

    var select = form.append('select')
        .attr('class','stacked-chunks')
        .attr('id', "chunkSelect")
        .on('change', function() {
            thisObj.changeStack(this);
        })
        .style("display", function() {
            if (turnOn) {
                return "";
            }
            return "none";
        });
    
    select.selectAll('option')
        .data(chunck).enter()
        .append('option')
            .attr("value", function(d,i) {
                return i;
            })
            .text(function (d) { return d; })
            .property("selected", function(d,i) {
                if (i===2) {
                    return true;
                }
                return false;
            });
}

DateBarChart.prototype.deleteBars = function() {
    this.g.selectAll(".bar").remove();
}

DateBarChart.prototype.removeLegend = function() {
    this.svg.selectAll(".legend").remove();
}

DateBarChart.prototype.changeStack = function(element) {
    this.deleteBars();
    this.removeLegend();
    this.createStackedBars(parseInt(element.value));
}

DateBarChart.prototype.changeChunkSelect = function(turnOn) {
    var display = turnOn ? "" : "none";
    var stackedSelect = document.getElementsByClassName("stacked-chunks")
    stackedSelect[0].style.display = display;
    stackedSelect[1].style.display = display;
}

DateBarChart.prototype.markSessions = function() {
    if (sessions.length > 0) {
        for (var i in sessions) {
            if (parseInt(i)===0) {
                continue;
            }
            var sessionDate = new Date(sessions[i].sessionDate);
            sessionDate.setUTCHours(0,0,0,0);
            this.g.append("line")
                .style("stroke", "black")
                .attr("x1", this.x(sessionDate))
                .attr("y1", 0)
                .attr("x2", this.x(sessionDate))
                .attr("y2", this.height)
                .attr("class", "session");
        }
    }
}

DateBarChart.prototype.addFirstAndLastTicks = function() {
    if (data["firstRecordedDay"].getUTCDate() < 21) {
        var dayString = data["firstRecordedDay"].getUTCDate() + " " + month[data["firstRecordedDay"].getUTCMonth()].substr(0, 3) + " " + data["firstRecordedDay"].getUTCFullYear();
        this.g
            .append("text")
            .attr("y", (this.height+(this.margin.top/2)-6))
            .attr("x", -20)
            .attr("fill", "black")
            .style("font-size", "10px")
            .text(dayString);
    }
    var newestDay = new Date(data["lastRecordedDay"].getTime()+86400000)
    newestDay.setUTCHours(0,0,0,0);
    if (newestDay.getUTCDate() > 10) {
        var dayString = newestDay.getUTCDate() + " " + month[newestDay.getUTCMonth()].substr(0, 3) + " " + newestDay.getUTCFullYear();
        this.g
            .append("text")
            .attr("y", (this.height+(this.margin.top/2)-6))
            .attr("x", this.width-(this.margin.left/2))
            .attr("fill", "black")
            .style("font-size", "10px")
            .text(dayString);
    }
}

DateBarChart.prototype.showSessionsSwitch = function(turnOn) {
    var thisObj = this;
    
    var form = this.svg.append("foreignObject")
        .attr("width", 120)
        .attr("height", 40)
        .attr("x", thisObj.width-thisObj.margin.left-thisObj.margin.right)
        .append("xhtml:body")
        .html("<span class='stacked-label'>Show sessions</span>");

    form.append("input")
        .attr("type", "checkbox")
        .attr("id", "showSessions")
        .attr("class", "stacked-checkbox")
        .property("checked", turnOn)
        .on("click", function(d, i){
            if (thisObj.svg.select("#showSessions").node().checked) {                
                thisObj.markSessions();
            } else {
                thisObj.deleteSessionMarks();
            }
        });
}

DateBarChart.prototype.deleteSessionMarks = function() {
    this.g.selectAll(".session").remove();
}
