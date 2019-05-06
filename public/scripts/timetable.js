function TimeTable(date, week, data, calendarMonth, calendarYear, maxInstance) {
    this.date = date;
    this.month = calendarMonth;
    this.year = calendarYear;
    this.week = week;
    this.data = data;
    
    this.colorScale = d3.scaleSequential(d3.interpolateYlOrRd).domain([1, maxInstance]);

    this.calendar = null;
    this.informationPanel = null;
    this.distributions = [];
}

TimeTable.prototype.create = function() {
    const table = d3.select('#timetable');
    const header = table.append('thead');
    const body = table.append('tbody');
    var theObject = this;

    header
        .append('tr')
        .append('td')
        .attr('colspan', 8)
        .style('text-align', 'center')
        .style('border-width', '0px')
        .append('h5')
        .text(theObject.getTitle());

    const tr = header.append('tr').attr("id", "headerTr");
    tr.append('td').attr('class', 'hour').style('border-top-width', "0px").append("span").text("00:00");
    tr.append('td').attr('class', 'hour-pointer');
    tr.selectAll('td.time-slot')
        .data(weekday)
        .enter()
        .append('td')
        .attr('class', function(d,i) {
            var classString = 'time-slot ';
            if (theObject.date.getUTCDate() === theObject.week[i].getUTCDate()) {
                classString += "selected-head ";
            }
            return classString;
        })        
        .attr('data-date-key', function(d,i) { return theObject.getDateAsDateString(theObject.week[i])})
        .on('click', function() {
            theObject.changeSelectedDay(this.getAttribute('data-date-key'), this);
        })
        .on('dblclick', function() {
            theObject.addAnnotation(this, "day");
        })
        .style('text-align', 'center')
        .text(function (d) {
          return d;
        })
        .append('div')
            .text(function(d, i) {                
                return theObject.week[i].getUTCDate();
            })
            .attr('style', 'text-align: center')
        .select(function(d,i) { return this.parentNode; })
            .append("i")
            .attr('class', 'far fa-comment note')
            .style('display', function(d,i) {
                var dayString = theObject.getDateAsDateString(theObject.week[i]);
                if (dayString in annotations) {
                    return "block";
                }
                return "none";
            })
            .append("div")
                .text(function(d,i) {
                    var dayString = theObject.getDateAsDateString(theObject.week[i]);
                    if (dayString in annotations) {
                        return annotations[dayString][0].comment;
                    }
                })
                .attr("class", "overlay");
    var distributionTd = tr.append("td").style("border-width", "0px");
    distributionTd.append("div")
        .attr("class", "distribution-header")
        .text("Average week");
    distributionTd.append("div")
        .attr("class", "distribution-header")
        .style("background-color", "steelblue")
        .text("Chosen week");
    
    for (var i=0; i<=23; i++) {
        var bodyTr = body.append('tr');
        for (var j=0; j<=9; j++) {
            var tempTd = bodyTr.append('td');                
            if (j === 0) {                
                if ((i+1) < 10) {
                    tempTd.append("span").text("0"+(i+1)+":00");
                } else {
                    tempTd.append("span").text((i+1)+":00");
                }
                tempTd.attr('class', 'hour');
            } else if (j===1) {
                tempTd.attr("class", "hour-pointer");
            } else if (j===9) {
                tempTd.attr("class", "distribution")
                this.distributions.push(tempTd);
                continue;              
            } else {
                var hourByDay = theObject.getHourByDayString(i, theObject.week[(j-2)]);
                var dayString = theObject.getDateAsDateString(theObject.week[(j-2)]);

                tempTd.text(function() {
                    if (hourByDay in theObject.data) {
                        return theObject.data[hourByDay];
                    } else if (hourByDay in data["invalidatedObservations"]) {
                        return data["invalidatedObservations"][hourByDay];
                    }
                    return "\u00A0";
                })
                .attr('data-hour-key', hourByDay)
                .attr('data-parent-day', dayString)
                .attr('data-timetable-weekday', (j-2))
                .attr('data-timetable-hour', i)
                .on('click', function(d) {
                    theObject.markChosenDay(this);
                })
                .on('dblclick', function() {
                    theObject.addAnnotation(this, "hour");
                })
                .style("background-color", function(d) {
                    if (hourByDay in theObject.data) {                
                        return theObject.colorScale(theObject.data[hourByDay]);
                    } else if (hourByDay in data["invalidatedObservations"]) {
                        return "lightblue";
                    }
                    return "white";
                })
                .attr('class', function() {
                    var classString = "";
                    if (theObject.date.getUTCDate() === theObject.week[(j-2)].getUTCDate()) {
                        classString += "selected-day ";
                        if (i===23) {
                            classString += "selected-day-last ";
                        }
                    }
                    return classString;
                });
                
                if (hourByDay in invalidObservations  && invalidObservations[hourByDay][0].comment !== "") {
                    tempTd.append("i")
                        .attr('class', 'far fa-comment note')
                        .append("div")
                            .text(invalidObservations[hourByDay][0].comment)
                            .attr("class", "overlay");
                } else if (hourByDay in annotations) {
                    tempTd
                        .append("i")
                        .attr('class', 'far fa-comment note')
                        .append("div")
                            .text(annotations[hourByDay][0].comment)
                            .attr("class", "overlay");
                }

                tempTd.style("color", function(d) {
                    if (hourByDay in data["hourToMarkAsChanged"]) {
                        return "#2DC446";
                    } 
                    return "black";
                });
            }

        }
    }

    this.addDistributionChart();
}

TimeTable.prototype.getDateAsDateString = function(date) {
    return (date.getUTCFullYear() +"-"+ (date.getUTCMonth()+1) +"-"+ date.getUTCDate());
}

TimeTable.prototype.getHourByDayString = function(hour, day) {
    var dayString = this.getDateAsDateString(day);

    return (dayString + "-" + hour);
}

TimeTable.prototype.getTitle = function() {
    var title = month[this.week[0].getUTCMonth()] + " " + this.week[0].getUTCFullYear();
    for (var i=1; i < this.week.length; i++) {
        if (this.week[i].getUTCMonth() !== this.week[0].getUTCMonth()) {
            if (this.week[i].getUTCFullYear() !== this.week[0].getUTCFullYear()) {
                title = month[this.week[0].getUTCMonth()] + " " + this.week[0].getUTCFullYear() 
                    + " - " + month[this.week[i].getUTCMonth()] + " " + this.week[i].getUTCFullYear();
            } else {
                title = month[this.week[0].getUTCMonth()] 
                    + " - " + month[this.week[i].getUTCMonth()] + " " + this.week[i].getUTCFullYear();
            }
            return title;
        }
    }
    return title;
}

TimeTable.prototype.remove = function() {
    var timetable = document.getElementById("timetable");			
    while (timetable.firstChild) {
        timetable.removeChild(timetable.firstChild);
    }
    this.distributions = [];
    this.removeBreakdownBarChart();
}

TimeTable.prototype.update = function(date,week, calendarMonth, calendarYear, dayInstances, wday) {
    this.date = date;
    this.month = calendarMonth;
    this.year = calendarYear;
    this.week = week;

    this.remove();
    this.create();

    if (this.informationPanel !== null) {
        this.informationPanel.updateAverageDay(dayInstances);
        this.informationPanel.setChosenWeekdayAverage(wday);
    }

    updateAverages(date);
}

TimeTable.prototype.addAnnotation = function(element, dateType) {
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
                var milliSecondString = (time.getUTCFullYear() 
                    + "-" + (time.getUTCMonth()+1) + "-" + time.getUTCDate() 
                    + "-" + time.getUTCHours() + "-" + time.getUTCMilliseconds());
                var node = document.createElement("LI");
                var textnode = document.createTextNode(
                    (time.getUTCHours() < 10 ? "0" : "") + time.getUTCHours() 
                    +  ":" + (time.getUTCMinutes() < 10 ? "0" : "") + time.getUTCMinutes()  
                    +  ":" + (time.getUTCSeconds() < 10 ? "0" : "") + time.getUTCSeconds()
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

TimeTable.prototype.markChosenDay = function(element, dayString) {
    var dayString = element.getAttribute('data-parent-day');
    var hourByDay = element.getAttribute('data-hour-key');
    
    this.changeSelectedDay(dayString, element);

    var hourSelected = document.querySelector("[data-hour-key='"+hourByDay+"']");
    hourSelected.classList += " chosenDay";

    if (this.informationPanel !== null) {
        var wDay = element.getAttribute('data-timetable-weekday');
        var hour = element.getAttribute('data-timetable-hour');
        this.informationPanel.updateAverageHour(parseInt(hourSelected.innerText), wDay, hour);
    }
}

TimeTable.prototype.changeSelectedDay = function(dayString, element) {
    this.removeBreakdownBarChart();
    var calendarDate = document.querySelector("[data-date='"+dayString+"']");
    if (calendarDate !== null) { 
        this.calendar.changeDay(calendarDate);    
    } else {
        var newDate = getCorrectUTCDate(element.getAttribute('data-parent-day'));
        this.date = newDate;
        this.remove();
        this.create();
        var hourByDay = element.getAttribute('data-hour-key');
        var hourSelected = document.querySelector("[data-hour-key='"+hourByDay+"']");
        hourSelected.classList += " chosenDay";
    }

    var theHour = element.getAttribute('data-timetable-hour');
    if (dayString in data['recordsEachDayAndHour'] 
        && theHour in data['recordsEachDayAndHour'][dayString]
        && data['recordsEachDayAndHour'][dayString][theHour].length > 0
    ) {
        this.addBreakdownBarChart(dayString, theHour);
    }
}

TimeTable.prototype.addBreakdownBarChart = function(dayString, theHour) {
    this.removeBreakdownBarChart();    
    var hourData = data['recordsEachDayAndHour'][dayString][theHour];
    var collectedData = [];
    for (var i=0; i<60; i++) {
        collectedData.push({
            type: i,
            sum: 0
        });
    }

    for (var instance in hourData) {
        var hour = hourData[instance].getUTCMinutes();
        collectedData[hour].sum++;
    }


    var hourChart = new TimeBarChart(
        collectedData,
        'minuteBreakdown',
        450,
        150,
        {top: 40, right: 60, bottom: 40, left: 20},
        "Observations on chosen hour",
        [0,60],
        false,
        {
            "xBarFontSize": "5px",
            "titleFontSize": "15px"
        }  
    );

    hourChart.create("Minute", "Observations", 1);
}
TimeTable.prototype.removeBreakdownBarChart = function() {
    var barChart = document.getElementById("minuteBreakdown");			
    while (barChart.firstChild) {
        barChart.removeChild(barChart.firstChild);
    }
}

TimeTable.prototype.addDistributionChart = function() {    
    var chosenDayString = d3.select('.selected-head').node().getAttribute('data-date-key');
    var chosenDay = getCorrectUTCDate(chosenDayString);
    var chosenWeek = (chosenDay.getWeekNumber()+"-"+chosenDay.getUTCFullYear());
    

    var barLength = d3.scaleLinear().rangeRound([0, 90]);
    barLength.domain([0, data["maxHourOverAllWeeks"]]);
    for (var i in this.distributions) {
        if (i < 24) {
            var distBar = this.distributions[i]
                .append("div")
                .attr("class", "distribution-bar")
                .style("width", barLength(data["averageHourOverAllWeeks"][i]) + "px")
                .style("height", "50%");
            
            if (chosenWeek in data["hourByWeek"]) {
                this.distributions[i]
                    .append("div")
                    .attr("class", "distribution-bar")
                    .style("width", barLength(data["hourByWeek"][chosenWeek][i]) + "px")
                    .style("height", "50%")
                    .style("background-color", "steelblue");
            }
            
            if (chosenDayString in data['recordsEachDayAndHour']) {
                //distBar.style("border-left", barLength(data['recordsEachDayAndHour'][chosenDayString][i].length) + "px solid steelblue");
            }
        }
    }
}