function FullCalendar(data, dayData, firstDate, lastDate, maxInstance, maxDayInstance, weekday) {
    this.data = data;
    this.dayData = dayData;
    this.firstDate = new Date(firstDate.getTime());
    this.lastDate = new Date(lastDate.getTime());
    this.weekday = weekday;
    this.colorScale = d3.scaleSequential(d3.interpolateYlOrRd).domain([1, maxInstance]);
    this.dayColorScale = d3.scaleSequential(d3.interpolateYlOrRd).domain([1, maxDayInstance]);
}

FullCalendar.prototype.create = function() {
    const table = d3.select('#fullCalendar');
    this.table = table;
    const header = table.append('thead');
    const body = table.append('tbody');
    var theObject = this;

    
    var monthTr = header.append("tr");
    monthTr.append("th").attr("class", "empty");
    monthTr.append("th").attr("class", "empty");

    const tr = header.append('tr').attr("id", "headerTr");    
    tr.append("th").attr("class", "hour")
        .append("span").attr("class", "hour-text").text("00:00")
    tr.append("th").attr("class", "empty");
    var currentDate = new Date (this.firstDate.getTime());
    currentDate.setHours(0,0,0,0);
    var days = [];
    while (currentDate <= this.lastDate)
    {
        var dayString = theObject.getDateAsDateString(currentDate);
        var currentDay = currentDate.getDay() === 0 ? 6 : currentDate.getDay()-1;
        if (this.weekday !== "" && currentDay != this.weekday) {
            currentDate.setDate(currentDate.getDate() + 1);
            continue;
        }

        if (currentDate.getDate() === 1 || days.length < 1
            || (currentDate.getDate() < 8 && this.weekday !== "")) {
            monthTr.append("th")
                .attr('data-timetable-date', dayString)
                .attr('class', 'month-label')
                .text(month[currentDate.getMonth()]);
        } else {
            monthTr.append("th")
                .attr('data-timetable-date', dayString)
                .attr('class', 'month-label');
        }
        
        var headDay = tr.append('th');
        headDay
            .attr('data-timetable-date', dayString)
            .style("background-color", function() {
                if (currentDate.getDay() === 0 || currentDate.getDay() === 6) {
                    return "lightgrey";
                } else {
                    return "white";
                }
            })
            .text(currentDate.getDay() === 0 ? weekday[6].substr(0,3) : weekday[(currentDate.getDay()-1)].substr(0,3))
            .append('div')
                .text(currentDate.getDate());

        if (dayString in annotations) {
            headDay.append("i")
                .attr('class', 'far fa-comment note')
                .append("div")
                    .text(annotations[dayString][0].comment)
                    .attr("class", "overlay");
        }
        headDay.on('dblclick', function() {
            theObject.addAnnotation(this, "day");
        });

        days.push(new Date(currentDate.getTime()));
        currentDate.setDate(currentDate.getDate() + 1);
    }

    for (var i=0; i<=24; i++) {
        var bodyTr = body.append('tr');
        for (var j=0; j<=days.length; j++) {
            if (j===0) {
                if (i===24) {
                    bodyTr.append("td").attr("class", "empty").text("sum").style("font-weight", "bold"); 
                    bodyTr.append("td").attr("class", "hour-border")   
                } else {
                    bodyTr.append("td").attr("class", "hour")
                        .append("span")
                        .attr("class", "hour-text")
                        .text(((i+1)<10 ? "0" : "") + (i+1) + ":00")
                    bodyTr.append("td").attr("class", "hour-border");
                } 
            } else if (i===24) {
                var dayString = theObject.getDateAsDateString(days[(j-1)]);
                var currentTd = bodyTr.append("td");
                currentTd.attr("class", "day-sum")
                    .attr('data-timetable-date', dayString)
                    .style("background-color", function() {
                        if (days[(j-1)].getDay() === 0 || days[(j-1)].getDay() === 6) {
                            return "lightgrey";
                        } else {
                            return "white";
                        }
                    });
                if (dayString in this.dayData && this.dayData[dayString] !== 0) {
                    currentTd
                        .text(this.dayData[dayString])
                        .style("background-color", theObject.dayColorScale(theObject.dayData[dayString]));
                }
                
            } else {
                var hourByDay = theObject.getHourByDayString(i, days[j-1]);
                var dayString = theObject.getDateAsDateString(days[(j-1)]);
                var currentTd = bodyTr.append("td");
                currentTd.style("background-color", function(d) {
                    if (hourByDay in theObject.data) {                
                        return theObject.colorScale(theObject.data[hourByDay]);
                    } else if (days[(j-1)].getDay() === 0 || days[(j-1)].getDay() === 6) {
                        return "lightgrey";
                    }
                    return "white";
                });
                currentTd.text(function() {
                    if (hourByDay in theObject.data) {                
                        return theObject.data[hourByDay];
                    }
                    return "\u00A0";
                });
    
                if (hourByDay in annotations) {
                    currentTd
                        .append("i")
                        .attr('class', 'far fa-comment note')
                        .append("div")
                            .text(annotations[hourByDay][0].comment)
                            .attr("class", "overlay");
                        
    
                }

                currentTd
                    .attr('data-hour-key', hourByDay)
                    .attr('data-parent-day', dayString)
                    .attr('data-timetable-date', dayString)
                    .attr('data-timetable-weekday', (j-1))
                    .attr('data-timetable-hour', i)
                    .on('dblclick', function() {
                        theObject.addAnnotation(this, "hour");
                })
            }
        }
    }
}

FullCalendar.prototype.getDateAsDateString = function(date) {
    return (date.getFullYear() +"-"+ (date.getMonth()+1) +"-"+ date.getDate());
}

FullCalendar.prototype.getHourByDayString = function(hour, day) {
    var dayString = this.getDateAsDateString(day);

    return (dayString + "-" + hour);
}


FullCalendar.prototype.remove = function() {
    var timetable = document.getElementById("fullCalendar");			
    while (timetable.firstChild) {
        timetable.removeChild(timetable.firstChild);
    }
}

FullCalendar.prototype.update = function(firstDate, lastDate, weekday) {
    this.weekday = weekday;
    this.firstDate = new Date(firstDate);
    this.lastDate = new Date(lastDate);

    if (!firstDate || !lastDate || this.firstDate > this.lastDate) {
        console.log("aaaaa")
        return;
    }
    this.remove();
    this.create();
}

FullCalendar.prototype.addAnnotation = function(element, dateType) {
    var systemName = "";
    var type = "";

    if (dateType === "day") {
        systemName = element.getAttribute('data-timetable-date');
        type = 'day';
    } else {
        systemName = element.getAttribute('data-hour-key');
        type = 'hour';
    }
    var dataset = document.getElementById("datasets").value;
    
    document.getElementById("datasets").value = dataset;
	document.getElementById("annotation-system-name").value = systemName;
    document.getElementById("annotation-type").value = type;

    if (systemName in annotations) {
        document.getElementById("annotation-comment").value = annotations[systemName][0].comment;
    } else {
        document.getElementById("annotation-comment").value = "";
    }
    
    document.getElementById("myDialog").showModal(); 
}

FullCalendar.prototype.setDatePickers = function(firstDate, lastDate) {
    document.getElementById("firstDate").value = firstDate.getFullYear() +"-"+((firstDate.getMonth()+1) < 10 ? "0" : "") + (firstDate.getMonth()+1) +"-"+ ((firstDate.getDate()) < 10 ? "0" : "") + firstDate.getDate();
    document.getElementById("lastDate").value = lastDate.getFullYear() +"-"+((lastDate.getMonth()+1) < 10 ? "0" : "") + (lastDate.getMonth()+1) +"-"+ ((lastDate.getDate()) < 10 ? "0" : "") + lastDate.getDate();
}