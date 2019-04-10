function MonthCalendar(htmlElement, date, data, maxInstance, overallData) {
    this.htmlElement = htmlElement;
    this.date = date;
    this.data = data;
    this.overallData = overallData;
    this.day = date.getDate();

    this.monthArray = this.getMonthMatrix(date.getFullYear(), date.getMonth());

    this.month = date.getMonth();
    this.year = date.getFullYear();
    
    this.colorScale = d3.scaleSequential(d3.interpolateYlOrRd).domain([0, maxInstance]);

    this.timeTable = null;
    this.informationPanel = null;
    this.week = this.getWeek();
}

MonthCalendar.prototype.getMonthMatrix = function(y, m) {
    var calendarMatrix = []

    var startDay = new Date(y, m, 1)
    var lastDay = new Date(y, m+1, 0)

    // Modify the result of getDay so that we treat Monday = 0 instead of Sunday = 0
    var startDow = (startDay.getDay() + 6) % 7;
    var endDow = (lastDay.getDay() + 6) % 7;

    // If the month didn't start on a Monday, start from the last Monday of the previous month
    startDay.setDate(startDay.getDate() - startDow);

    // If the month didn't end on a Sunday, end on the following Sunday in the next month
    lastDay.setDate(lastDay.getDate() + (6-endDow));

    var week = []
    while(startDay <= lastDay){
        week.push(new Date(startDay));
        if (week.length === 7){
          calendarMatrix.push(week);
          week = []
        }
        startDay.setDate(startDay.getDate() + 1)
    }

    return calendarMatrix;
}

MonthCalendar.prototype.getWeek = function() {
    for (var row in this.monthArray) {
        for (var col in this.monthArray[row]) {
            if (this.date.getDate() == this.monthArray[row][col].getDate() 
                && this.date.getMonth() == this.monthArray[row][col].getMonth()
            ) {
                return this.monthArray[row];
            }
        }
    }
    return [];
}

MonthCalendar.prototype.create = function() {
    const element = d3.select(this.htmlElement);
    const floatableDiv = element.append("div").attr("class", "col");
    const table = floatableDiv.append("table").attr("class", "calendar");
    const header = table.append('thead');
    const body = table.append('tbody');
    var theObject = this;
      
    const tr = header.append('tr');
    /*
    tr.append('td')
        .attr('colspan', 1)
        .attr('class', 'change-month')
        .style('text-align', 'left')
        .on('click', function() {
            theObject.changeMonth("back");
        })
        .append('h5')
        .text("<")
    tr.append('td')
        .attr('colspan', 1)
        .attr('class', 'change-month')
        .style('text-align', 'left')
        .on('click', function() {
            theObject.changeMonth("next");
        })
        .append('h5')
        .text(">");
        */
    tr.append('td')
        .attr('colspan', 7)
        .style('text-align', 'center')
        .append('h5')
        .text(month[this.month] + " " + this.year)
    
    tr.append('td')

/*
    tr.append('td')
        .text("Show distribution")
        .on("click", function() {
            theObject.toggleDistribution()
        })
        .style("font-size", "10px")
        .style("cursor", "pointer")
  */    
    header
        .append('tr')
        .attr("class", "calendar-header-week")
        .selectAll('td')
        .data(weekday)
        .enter()
        .append('td')
        .style('text-align', 'center')
        .style('border', "none")
        .text(function (d) {
          return d.charAt(0);
        });
      
    this.monthArray.forEach(function (week) {
        body
            .append('tr')
            .attr("class", "calendar-week")
            .selectAll('td')
            .data(week)
            .enter()
            .append('td')
            .attr('data-date', function(d) { return theObject.getDateAsDateString(d)})
            .attr('data-day', function(d) { return d.getDate()})
            .attr('data-weekday', function(d,i) { return i})
            .attr('class', function(d) {
                var classString = "";
                if (this.getAttribute('data-date') === theObject.getDateAsDateString(theObject.date)) {
                    //classString += 'chosen-day ';
                }
                
                if (d.getMonth() !== theObject.month) {
                    classString += 'hide-day ';
                }
                return classString;
            })
            .text(function (d) {              
                return d.getDate();
            })
            .on('click', function() {
                //theObject.changeDay(this);
            })
            .append('div')
                .text(function(d) {
                    var dayString = theObject.getDateAsDateString(d);
                    if (dayString in theObject.data && theObject.data[dayString] !== 0) {                  
                        return theObject.data[dayString];
                    }
                    return "\u00A0";
                })
                .attr('style', 'text-align: center')
                .style("background-color", function(d) {
                    var dayString = theObject.getDateAsDateString(d);
                    if (dayString in theObject.data && theObject.data[dayString] !== 0) {                  
                        return theObject.colorScale(theObject.data[dayString]);
                    }
                    return "white";
                })
    });
}

MonthCalendar.prototype.getDateAsDateString = function(date) {
    return (date.getFullYear() +"-"+ (date.getMonth()+1) +"-"+ date.getDate());
}

MonthCalendar.prototype.changeMonth = function(direction) {
    if (direction === 'next') {
        this.year = this.month === 11 ? this.year+1 : this.year;
        this.month = this.month === 11 ? 0 : this.month+1;
    } else {
        this.year = this.month === 0 ? this.year-1 : this.year;
        this.month = this.month === 0 ? 11 : this.month-1;
    }
    this.monthArray = this.getMonthMatrix(this.year, this.month);
 
    this.remove();
    this.create();
    this.addDistribution();
}

MonthCalendar.prototype.changeDay = function(newTd) {
    var chosenDay = document.getElementsByClassName('chosen-day');
    if (chosenDay.length > 0) {
        chosenDay[0].classList.remove("chosen-day")
    }
    newTd.classList.add("chosen-day");
    this.date = new Date(newTd.getAttribute('data-date'));
    this.day = newTd.getAttribute('data-day');
    var wday = newTd.getAttribute('data-weekday');
    this.week = this.getWeek();
    this.timeTable.update(this.date, this.week, this.month, this.year, parseInt(newTd.lastChild.innerText), wday);
}

MonthCalendar.prototype.remove = function() {
    var calendar = document.getElementById("calendar");			
    while (calendar.firstChild) {
        calendar.removeChild(calendar.firstChild);
    }
}

MonthCalendar.prototype.addDistribution = function() {
    var thisObj = this;

    var barLength = d3.scaleLinear().rangeRound([0, 90]);
    barLength.domain([0, data["maxWeek"]]);

    d3.select(".calendar-header-week")
        .append("td")
        .append("div")  
            .attr("class", "calendar-distribution")          
            .style("width", (barLength(data["averageWeek"]) + "px"))
            .style("height", "100%")
            .style("background-color", "lightsteelblue")
            .text("Avg")
            .style("font-size", "12px")
            .style("text-align", "center")

    d3.selectAll(".calendar-week")
        .append("td")
        .style("width", "90px")
        .attr("class", "calendar-distribution")
        .style("border-width", "0px")
        .append("div")            
            .style("width", function(d,i) {
                var firstDayInWeek = thisObj.monthArray[i][0];
                var weekString = (firstDayInWeek.getWeekNumber() === 1 && firstDayInWeek.getMonth() === 11) ? (firstDayInWeek.getWeekNumber()+"-"+(firstDayInWeek.getFullYear()+1)) : (firstDayInWeek.getWeekNumber()+"-"+firstDayInWeek.getFullYear());
                return barLength(weekString in data["sumOfEachWeek"] ? data["sumOfEachWeek"][weekString] : 0) + "px";
            })
            .style("height", "100%")
            .style("background-color", "steelblue")
}

MonthCalendar.prototype.toggleDistribution = function() {
    var dist  = d3.selectAll(".calendar-distribution");
    dist.classed("calendar-hidden-distribution", function() {
        return (this.classList.contains('calendar-hidden-distribution')) ? false : true;
    })
}