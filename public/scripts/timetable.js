function TimeTable(date, week, data, maxInstance) {
    this.date = date;
    this.month = date.getMonth();
    this.year = date.getFullYear();
    this.week = week;
    this.data = data;
    
    this.colorScale = d3.scaleSequential(d3.interpolateYlOrRd).domain([0, maxInstance]);    
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
        .append('h5')
        .text(theObject.getTitle());

    const tr = header.append('tr');
    tr.append('td').text("00:00").attr('class', 'hour');
    tr.selectAll('td.time-slot')
        .data(weekday)
        .enter()
        .append('td')
        .attr('class', 'time-slot')
        .style('text-align', 'center')
        .text(function (d) {
          return d;
        })
        .append('div')
            .text(function(d, i) {                
                return theObject.week[i] < 0 ? -1*theObject.week[i] : theObject.week[i];
            })
            .attr('style', 'text-align: center');
    
    for (var i=0; i<=23; i++) {
        var bodyTr = body.append('tr');
        for (var j=0; j<=7; j++) {
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
            } else {
                var hourByDay = theObject.date.getFullYear() + "-" +  (theObject.date.getMonth()+1) + "-" + (theObject.week[j-1] < 0 ? -1*theObject.week[j-1] : theObject.week[j-1]) + "-" + i;
                tempTd.text(function() {
                    if (hourByDay in theObject.data) {
                        return theObject.data[hourByDay];
                    }
                    return 0;
                })
                .style("background-color", function(d) {
                    var dayString = theObject.getDayString(d);
                    if (hourByDay in theObject.data) {                
                        return theObject.colorScale(theObject.data[hourByDay]);
                    }
                    return "white";
                });;
            }

        }
    }
}

TimeTable.prototype.getDayString = function(d) {
    var currentMonth = (this.month+1);
    var currentYear = this.year;
    if (d < 0 && -1*d < 10) {
        if (currentMonth == 12) {
            currentMonth = 1;
            currentYear += 1;
        }
        currentMonth++;
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
    return dateString
}

TimeTable.prototype.getTitle = function() {
    var title = month[this.date.getMonth()] + " " + this.date.getFullYear();
    if (this.week[0] < 0 || this.week[6] < 0) {        
        if (this.date.getDate() > 10) {
            if (this.date.getMonth() === 11) {
                title = month[11] + " " + this.date.getFullYear() + "-" + month[0] + " " + (this.date.getFullYear()+1);
            } else {
                title = month[this.date.getMonth()] + "-" + month[this.date.getMonth()+1] + " " + this.date.getFullYear(); 
            }
        } else {
            if (this.date.getMonth() === 0) {
                title = month[11] + " " + (this.date.getFullYear()-1) + "-" + month[0] + " " + (this.date.getFullYear());
            } else {
                title = month[this.date.getMonth()-1] + "-" + month[this.date.getMonth()] + " " + this.date.getFullYear(); 
            }
        } 
    }

    return title;
}

TimeTable.prototype.remove = function() {
    var timetable = document.getElementById("timetable");			
    while (timetable.firstChild) {
        timetable.removeChild(timetable.firstChild);
    }
}

TimeTable.prototype.update = function(date,week) {
    this.date = date;
    this.month = date.getMonth();
    this.year = date.getFullYear();
    this.week = week;

    this.remove();
    this.create();
}
