function Calendar(date, data, maxInstance, overallData) {
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

Calendar.prototype.getMonthMatrix = function(y, m) {
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

Calendar.prototype.getWeek = function() {
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

Calendar.prototype.create = function() {
    const table = d3.select('#calendar');
    const header = table.append('thead');
    const body = table.append('tbody');
    var theObject = this;
      
    const tr = header.append('tr');
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
        .attr('colspan', 5)
        .style('text-align', 'center')
        .append('h5')
        .text(month[this.month] + " " + this.year)
    tr.append('td')
        .attr('colspan', 1)
        .attr('class', 'change-month')
        .style('text-align', 'right')
        .on('click', function() {
            theObject.changeMonth("next");
        })
        .append('h5')
        .text(">");
      
    header
        .append('tr')
        .selectAll('td')
        .data(weekday)
        .enter()
        .append('td')
        .style('text-align', 'center')
        .text(function (d) {
          return d.charAt(0);
        });
      
    this.monthArray.forEach(function (week) {
        body
            .append('tr')
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
                    classString += 'chosen-day ';
                }
                if (d < 0) {
                    classString += 'month-outside ';
                }
                return classString;
            })
            .text(function (d) {              
                return d.getDate();
            })
            .on('click', function() {
                theObject.changeDay(this);
            })
            .append('div')
                .text(function(d) {
                    var dayString = theObject.getDateAsDateString(d);
                    if (dayString in theObject.data) {                  
                        return theObject.data[dayString];
                    }
                    return "";
                })
                .attr('style', 'text-align: center')
                .style("background-color", function(d) {
                    var dayString = theObject.getDateAsDateString(d);
                    if (dayString in theObject.data) {                  
                        return theObject.colorScale(theObject.data[dayString]);
                    }
                    return "white";
                })
    });
}

Calendar.prototype.getDateAsDateString = function(date) {
    return (date.getFullYear() +"-"+ (date.getMonth()+1) +"-"+ date.getDate());
}

Calendar.prototype.changeMonth = function(direction) {
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
}

Calendar.prototype.changeDay = function(newTd) {
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

Calendar.prototype.remove = function() {
    var calendar = document.getElementById("calendar");			
    while (calendar.firstChild) {
        calendar.removeChild(calendar.firstChild);
    }
}
