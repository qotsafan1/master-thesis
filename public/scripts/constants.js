var month = new Array(12);
    month[0] = "January";
    month[1] = "February";
    month[2] = "March";
    month[3] = "April";
    month[4] = "May";
    month[5] = "June";
    month[6] = "July";
    month[7] = "August";
    month[8] = "September";
    month[9] = "October";
    month[10] = "November";
    month[11] = "December";

var weekday = new Array(7);
weekday[0] = "Monday";
weekday[1] = "Tuesday";
weekday[2] = "Wednesday";
weekday[3] = "Thursday";
weekday[4] = "Friday";
weekday[5] = "Saturday";
weekday[6] = "Sunday";

function setClockTo(dateObject, time) {
    dateObject.setHours(time[0]);
    dateObject.setMinutes(time[1]);
    dateObject.setSeconds(time[2]);
}

function daysInMonth (month, year) { // Use 1 for January, 2 for February, etc.
    return new Date(year, month, 0).getDate();
  }

function monthDiff(d1, d2) {
    var months;
    months = (d2.getFullYear() - d1.getFullYear()) * 12;
    months -= d1.getMonth() + 1;
    months += d2.getMonth();
    return months <= 0 ? 0 : months;
}

function getCountOfEachWeekday(d1, d2) {
    var date1 = new Date(d1.getTime());
    setClockTo(date1, [0,0,0]);
    var date2 = new Date(d2.getTime());
    setClockTo(date2, [0,0,0]);
    var weekdayCount = [];
    for (var i=0;i<7;i++) {
        weekdayCount[i] = 0;
    }
    var currentDate = date1;
    while ( currentDate.getTime() <= date2.getTime() )
    {
        var currentDay = currentDate.getDay() === 0 ? 6 : currentDate.getDay()-1;
        weekdayCount[currentDay]++;
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return weekdayCount;
}

function getNumberOfDayBetweenTwoDates(d1, d2) {
    var date1 = new Date(d1.getTime());
    setClockTo(date1, [0,0,0]);
    var date2 = new Date(d2.getTime());
    setClockTo(date2, [0,0,0]);
    var totalDays = 0;
    var currentDate = date1;
    while (currentDate.getTime() <= date2.getTime())
    {
        totalDays++;
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return totalDays;
}

Date.prototype.getWeekNumber = function(){
    var d = new Date(Date.UTC(this.getFullYear(), this.getMonth(), this.getDate()));
    var dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    var yearStart = new Date(Date.UTC(d.getUTCFullYear(),0,1));
    return Math.ceil((((d - yearStart) / 86400000) + 1)/7)
};