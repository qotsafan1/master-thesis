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
    weekday[0] = "Sunday";
    weekday[1] = "Monday";
    weekday[2] = "Tuesday";
    weekday[3] = "Wednesday";
    weekday[4] = "Thursday";
    weekday[5] = "Friday";
    weekday[6] = "Saturday";

function setClockTo(dateObject, time) {
    dateObject.setHours(time[0]);
    dateObject.setMinutes(time[1]);
    dateObject.setSeconds(time[2]);
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
    var date2 = new Date(d2.getTime());
    var weekdayCount = [];
    for (var i=0;i<7;i++) {
        weekdayCount[i] = 0;
    }
    var currentDate = date1;
    while ( currentDate.getTime() <= date2.getTime() )
    {
       weekdayCount[currentDate.getDay()]++;
       currentDate.setDate(currentDate.getDate() + 1);
    }

    return weekdayCount;
}

function getNumberOfDayBetweenTwoDates(d1, d2) {
    var date1 = new Date(d1.getTime());
    var date2 = new Date(d2.getTime());
    var totalDays = 0;
    var currentDate = date1;
    while (currentDate.getTime() <= date2.getTime())
    {
        totalDays++;
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return totalDays;
}