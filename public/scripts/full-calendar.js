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

        var monthLabel = monthTr.append("th")
            .attr('data-timetable-date', dayString)
            .attr('class', 'month-label')
            .append("div")
            .text(month[currentDate.getMonth()]);
        if (currentDate.getDate() === 1 || days.length < 1
            || (currentDate.getDate() < 8 && this.weekday !== "")) {            
        } else {
            monthLabel
                .style("display", "none");
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

        if (currentDate.getDate() === 1) {
            headDay.style("border-left-width", "1.7px")
        }

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
                    .attr('data-date-key', dayString)
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
                }  else if (dayString in data["invalidatedObservations"]) {
                    currentTd
                        .text(data["invalidatedObservations"][dayString])
                        .style("background-color", "lightblue");
                } 
                currentTd.on('dblclick', function() {
                    theObject.addAnnotation(this, "day");
                });

                if (dayString in invalidObservations && invalidObservations[dayString][0].comment !== "") {
                    currentTd.append("i")
                        .attr('class', 'far fa-comment note')
                        .append("div")
                            .text(invalidObservations[dayString][0].comment)
                            .attr("class", "overlay");
                } else if (dayString in annotations) {
                    currentTd.append("i")
                        .attr('class', 'far fa-comment note')
                        .append("div")
                            .text(annotations[dayString][0].comment)
                            .attr("class", "overlay");
                }
                
            } else {
                var hourByDay = theObject.getHourByDayString(i, days[j-1]);
                var dayString = theObject.getDateAsDateString(days[(j-1)]);

                var currentTd = bodyTr.append("td");
                currentTd.style("background-color", function(d) {
                    if (hourByDay in theObject.data) {                
                        return theObject.colorScale(theObject.data[hourByDay]);
                    } else if (hourByDay in data["invalidatedObservations"]) {
                        return "lightblue";
                    } else if (days[(j-1)].getDay() === 0 || days[(j-1)].getDay() === 6) {
                        return "lightgrey";
                    }
                    return "white";
                });
                currentTd.text(function() {
                    if (hourByDay in theObject.data) {                
                        return theObject.data[hourByDay];
                    } else if (hourByDay in data["invalidatedObservations"]) {
                        return data["invalidatedObservations"][hourByDay];
                    }
                    return "\u00A0";
                });

                currentTd.style("color", function(d) {
                    if (hourByDay in data["hourToMarkAsChanged"]) {
                        return "#2DC446";
                    } 
                    return "black";
                });
    
                if (hourByDay in invalidObservations  && invalidObservations[hourByDay][0].comment !== "") {
                    currentTd.append("i")
                        .attr('class', 'far fa-comment note')
                        .append("div")
                            .text(invalidObservations[hourByDay][0].comment)
                            .attr("class", "overlay");
                } else if (hourByDay in annotations) {
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

                if (i===12) {
                    currentTd.style("border-top-width", "1.7px")
                }

                if (days[(j-1)].getDate() === 1) {
                    currentTd.style("border-left-width", "1.7px")
                }
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
        systemName = element.getAttribute('data-date-key');
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
    
    var validateButton = document.getElementById("invalidateObservation");
    if (systemName in invalidObservations) {
        validateButton.innerHTML = "Allow observations";
        validateButton.value = "delete";
    } else {
        validateButton.innerHTML = "Invalidate observations";
        validateButton.value = "add";
    }

    var observationColumn = document.getElementById("listHourObs");
    while (observationColumn.firstChild) {
        observationColumn.removeChild(observationColumn.firstChild);
    }
    observationColumn.parentElement.style.display = "none";

    var newHeaderLabel = "Write annotation for day " + systemName;

    if (type === "hour") {
        observationColumn.parentElement.style.display = "";
        var hour = element.getAttribute('data-timetable-hour');
        var dayKey = element.getAttribute('data-parent-day');
        newHeaderLabel = "Write annotation for day " + dayKey + " at hour " + (parseInt(hour) < 10 ? "0" : "") + hour + ":00";
        if (dayKey in data["allRecordsEachDayAndHour"]) {
            for (var i in data["allRecordsEachDayAndHour"][dayKey][hour]) {
                var time = data["allRecordsEachDayAndHour"][dayKey][hour][i];
                var milliSecondString = (time.getFullYear() 
                    + "-" + (time.getMonth()+1) + "-" + time.getDate() 
                    + "-" + time.getHours() + "-" + time.getMilliseconds());
                var node = document.createElement("LI");
                var textnode = document.createTextNode(
                    (time.getHours() < 10 ? "0" : "") + time.getHours() 
                    +  ":" + (time.getMinutes() < 10 ? "0" : "") + time.getMinutes()  
                    +  ":" + (time.getSeconds() < 10 ? "0" : "") + time.getSeconds()
                );
                node.appendChild(textnode);
                var button = document.createElement("button");
                
                if (milliSecondString in data["singleInvalidatedObservations"]) {
                    button.classList += "btn btn-primary btn-sm";
                    button.appendChild(document.createTextNode("Allow"));
                    button.addEventListener("click", function() {
                        invalidateSingleObservation(this, "delete");
                    });
                } else {
                    button.classList += "btn btn-secondary btn-sm";
                    button.appendChild(document.createTextNode("Invalidate"));
                    button.addEventListener("click", function() {
                        invalidateSingleObservation(this, "create");
                    });
                }
                button.setAttribute("data-system-name", milliSecondString);

                node.appendChild(button);
                observationColumn.appendChild(node);
            }

        }
    }

    document.getElementById("annotationHeader").innerText = newHeaderLabel;

    document.getElementById("writeAnnotation").showModal(); 
}