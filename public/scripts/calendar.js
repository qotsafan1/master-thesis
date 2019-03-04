function Calendar(date, data, maxInstance, overallData) {
    this.date = date;
    this.data = data;
    this.overallData = overallData;
    this.day = date.getDate();

    this.monthArray = this.getMatrix(date.getFullYear(), date.getMonth());

    this.month = date.getMonth();
    this.year = date.getFullYear();
    
    this.colorScale = d3.scaleSequential(d3.interpolateYlOrRd).domain([0, maxInstance]);

    this.timeTable = null;
    this.informationPanel = null;
    this.week = this.getWeek();
}

//https://github.com/bclinkinbeard/calendar-matrix/blob/master/index.js
Calendar.prototype.getMatrix = function(y, m) {
    var rows = [0,1,2,3,4,5];
    var cols = [0,1,2,3,4,5,6];
    var matrix = [];
    var date = new Date(y, m);
    var numDays = new Date(y, m + 1, 0).getDate();
    var dayNum;

    _.each(rows, function (row) {
        var week = [];

        _.each(cols, function (col) {
        if (row == 0) {
            dayNum = col - date.getDay() + 1;
            week.push(col < date.getDay() ? -(new Date(y, m, -(date.getDay() - 1 - col)).getDate()) : dayNum);
        } else {
            dayNum = _.last(matrix)[6] + col + 1;
            week.push(dayNum <= numDays ? dayNum : -(dayNum - numDays));
        }
        });

        if (!row || week[0] > 1) matrix.push(week);

    });

    return matrix;
}

Calendar.prototype.getWeek = function() {
    for (var row in this.monthArray) {
        for (var col in this.monthArray[row]) {
            if (this.day == this.monthArray[row][col]) {
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
            .attr('data-date', function(d) { return theObject.getDayString(d)})
            .attr('data-day', function(d) { return d})
            .attr('class', function(d) {
                var classString = "";
                if (this.getAttribute('data-date') === theObject.getDateAsDateString()) {
                    classString += 'chosen-day ';
                }
                if (d < 0) {
                    classString += 'month-outside ';
                }
                return classString;
            })
            .text(function (d) {              
                return d > 0 ? d : -1*d;
            })
            .on('click', function() {
                theObject.changeDay(this);
            })
            .append('div')
                .text(function(d) {
                    var dayString = theObject.getDayString(d);
                    if (dayString in theObject.data) {                  
                        return theObject.data[dayString];
                    }
                    return "";
                })
                .attr('style', 'text-align: center')
                .style("background-color", function(d) {
                    var dayString = theObject.getDayString(d);
                    if (dayString in theObject.data) {                  
                        return theObject.colorScale(theObject.data[dayString]);
                    }
                    return "white";
                })
                /*
                .append("i")
                    .attr('class', 'far fa-comment note')
                    .style('display', function(d,i) {
                        var dayString = theObject.getDayString(d);
                        if (dayString in annotations) {
                            return "block";
                        }
                        return "none";
                    })
                    .append("div")
                        .text(function(d,i) {
                            var dayString = theObject.getDayString(d);
                            if (dayString in annotations) {
                                return annotations[dayString][0].comment;
                            }
                        })
                        .attr("class", "overlay-right");
                        */
    });
}

Calendar.prototype.getDayString = function(d) {
    var currentMonth = (this.month+1);
    var currentYear = this.year;
    if (d < 0 && -1*d < 10) {
        if (currentMonth == 12) {
            currentMonth = 1;
            currentYear += 1;
        } else {
            currentMonth++;
        }
    }
    else if (d < 0 && -1*d > 20) {
        if (currentMonth == 1) {
            currentMonth = 12;
            currentYear -= 1;
        } else {
            currentMonth--;
        }
    }
    var dateString = currentYear + "-" + currentMonth + "-" + (d > 0 ? d : -1*d);
    return dateString;
}

Calendar.prototype.getDateAsDateString = function() {
    return (this.date.getFullYear() +"-"+ (this.date.getMonth()+1) +"-"+ this.date.getDate());
}

Calendar.prototype.changeMonth = function(direction) {
    if (direction === 'next') {
        this.year = this.month === 11 ? this.year+1 : this.year;
        this.month = this.month === 11 ? 0 : this.month+1;
    } else {
        this.year = this.month === 0 ? this.year-1 : this.year;
        this.month = this.month === 0 ? 11 : this.month-1;
    }
    this.monthArray = this.getMatrix(this.year, this.month);    
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
    this.week = this.getWeek();
    this.timeTable.update(this.date, this.week, this.month, this.year);

    if (this.informationPanel !== null) {
        this.informationPanel.updateAverageDay(parseInt(newTd.lastChild.innerText));
    }
}

Calendar.prototype.remove = function() {
    var calendar = document.getElementById("calendar");			
    while (calendar.firstChild) {
        calendar.removeChild(calendar.firstChild);
    }
}
