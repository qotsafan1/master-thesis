function TimeTable(date, week, data, calendarMonth, calendarYear, maxInstance) {
    this.date = date;
    this.month = calendarMonth;
    this.year = calendarYear;
    this.week = week;
    this.data = data;
    
    this.colorScale = d3.scaleSequential(d3.interpolateYlOrRd).domain([0, maxInstance]);

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
    tr.append('td').text("00:00").attr('class', 'hour').style('border-top-width', "0px");
    tr.selectAll('td.time-slot')
        .data(weekday)
        .enter()
        .append('td')
        .attr('class', function(d,i) {
            var classString = 'time-slot ';
            if (theObject.date.getDate() === theObject.week[i].getDate()) {
                classString += "selected-head ";
            }
            return classString;
        })        
        .attr('data-timetable-date', function(d,i) { return theObject.getDateAsDateString(theObject.week[i])})
        .on('click', function() {
            theObject.changeSelectedDay(this.getAttribute('data-timetable-date'), this);
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
                return theObject.week[i].getDate();
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
        for (var j=0; j<=8; j++) {
            var tempTd = bodyTr.append('td');                
            if (j === 0) {                
                if ((i+1) < 10) {
                    tempTd.text("0"+(i+1)+":00");
                } else {
                    tempTd.text((i+1)+":00");
                }
                tempTd.attr('class', 'hour');
            } else if (j===0) {
              continue;
            } else if (j===8) {
                tempTd.attr("class", "distribution")
                this.distributions.push(tempTd);
                continue;              
            } else {
                var hourByDay = theObject.getHourByDayString(i, theObject.week[(j-1)]);
                var dayString = theObject.getDateAsDateString(theObject.week[(j-1)]);

                tempTd.text(function() {
                    if (hourByDay in theObject.data) {
                        return theObject.data[hourByDay];
                    }
                    return "\u00A0";
                })
                .attr('data-hour-key', hourByDay)
                .attr('data-parent-day', dayString)
                .attr('data-timetable-weekday', (j-1))
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
                    }
                    return "white";
                })
                .attr('class', function() {
                    var classString = "";
                    if (theObject.date.getDate() === theObject.week[(j-1)].getDate()) {
                        classString += "selected-day ";
                        if (i===23) {
                            classString += "selected-day-last ";
                        }
                    }
                    return classString;
                });
                
                if (hourByDay in annotations) {
                    tempTd
                        .append("i")
                        .attr('class', 'far fa-comment note')
                        .append("div")
                            .text(annotations[hourByDay][0].comment)
                            .attr("class", "overlay");
                        

                }
            }

        }
    }

    this.addDistributionChart();
}

TimeTable.prototype.getDateAsDateString = function(date) {
    return (date.getFullYear() +"-"+ (date.getMonth()+1) +"-"+ date.getDate());
}

TimeTable.prototype.getHourByDayString = function(hour, day) {
    var dayString = this.getDateAsDateString(day);

    return (dayString + "-" + hour);
}

TimeTable.prototype.getTitle = function() {
    var title = month[this.week[0].getMonth()] + " " + this.week[0].getFullYear();
    for (var i=1; i < this.week.length; i++) {
        if (this.week[i].getMonth() !== this.week[0].getMonth()) {
            if (this.week[i].getFullYear() !== this.week[0].getFullYear()) {
                title = month[this.week[0].getMonth()] + " " + this.week[0].getFullYear() 
                    + " - " + month[this.week[i].getMonth()] + " " + this.week[i].getFullYear();
            } else {
                title = month[this.week[0].getMonth()] 
                    + " - " + month[this.week[i].getMonth()] + " " + this.week[i].getFullYear();
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
}

TimeTable.prototype.addAnnotation = function(element, dateType) {
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
        var newDate = new Date(element.getAttribute('data-parent-day'));
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
        var hour = hourData[instance].getMinutes();
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
    var chosenDayString = d3.select('.selected-head').node().getAttribute('data-timetable-date');
    var chosenDay = new Date(chosenDayString);
    var chosenWeek = (chosenDay.getWeekNumber()+"-"+chosenDay.getFullYear());
    

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