var childGraphs;
var unFilteredData;
var annotations = [];
//2016-09-05T18:13:46.105Z
var strictIsoParse = d3.utcParse("%Y-%m-%dT%H:%M:%S.%LZ");

function getAnnotations(dataset) {
    annotations = [];
    var xmlhttp = new XMLHttpRequest();
    xmlhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            var result = JSON.parse(this.responseText);

            for (annotation in result.annotations)
            {
                if (!(result.annotations[annotation].systemName in annotations)) {
                    annotations[result.annotations[annotation].systemName] = [];
                }

                annotations[result.annotations[annotation].systemName].push({
                    "comment": result.annotations[annotation].comment,
                    "creationDate": result.annotations[annotation].creationDate,
                    "type": result.annotations[annotation].type,
                    "id": result.annotations[annotation].id
                });
            }
            createVisualization(dataset);
        }
    };
    xmlhttp.open("GET", ("/annotations?dataset="+dataset), true);
    xmlhttp.send();
}


function createVisualization(dataset) {
    childGraphs = [];
    data = [];
    data["byMonth"] = [];
    data["byDay"] = [];
    data["byWeek"] = [];
    data['firstMonth'] = 12;
    data['lastMonth'] = 1;
    data['firstYear'] = 2030;
    data['lastYear'] = 1000;
    data['maxHourOfDay'] = 0;
    data['lastRecordedDay'] = new Date("1971-1-1");
    data['firstRecordedDay'] = new Date("2050-1-1");
    data['recordsEachDayAndHour'] = [];

    data['filteredData'] = [];

    var lastRecordDate = new Date("1971-1-1");
    
    numberOfMonths = [];

    d3.csv("data/" + dataset).then(function(rawData) {
        unFilteredData = rawData;
        console.log(rawData)

        var countMonth = [];
        var countWeekday = [];
        for (var i in weekday) {
            countWeekday[weekday[i]] = 0;
        }

        var countHour = [];
        var countEachDay = [];
        var countWeeks = [];
        var countEachHourOfEachWeek = [];
        var countEachHourOfEachDay = [];
        var countEachHourOfEachWeekday = [];

        for (var i=0; i<24;i++) {
            countHour[i] = 0;
        }

        for (var d in weekday) {
            countEachHourOfEachWeekday[d] = [];
            for (var i=0; i<24; i++) {
                countEachHourOfEachWeekday[d][i] = 0;
            }
        }

        for (var instance in rawData) {
            var date = Object.keys(rawData[instance])[0]
            if (date !== "date") {
                continue;
            }

            var isoDate = strictIsoParse(rawData[instance][date]);

            var diff = isoDate.getTime() - lastRecordDate.getTime();
            if (diff > 4000) {
                data['filteredData'].push(isoDate);
                lastRecordDate = isoDate;	
            }

            var currentWeek = isoDate.getWeekNumber() + "-" + isoDate.getFullYear();
            sumData(currentWeek, countWeeks);

            var currentMonth = month[isoDate.getMonth()]
            sumData(currentMonth, countMonth);

            var currentDay = isoDate.getDay() === 0 ? weekday[6] : weekday[(isoDate.getDay()-1)];

            sumData(currentDay, countWeekday);
            sumData(isoDate.getHours(), countHour);

            var dayOfMonth = isoDate.getFullYear() + "-" + (isoDate.getMonth()+1) + "-" + isoDate.getDate();
            if (dayOfMonth in countEachDay) {
                countEachDay[dayOfMonth]++;
            } else {
                countEachDay[dayOfMonth] = 1;					
            }

            // sum of each hour of each day
            var hourOfDay = dayOfMonth + "-" +isoDate.getHours();
            if (hourOfDay in countEachHourOfEachDay) {
                countEachHourOfEachDay[hourOfDay]++;
            } else {
                countEachHourOfEachDay[hourOfDay] = 1;
            }

            // sum of each hour of each weekday
            countEachHourOfEachWeekday[isoDate.getDay()][isoDate.getHours()]++; 

            if (dayOfMonth in data['recordsEachDayAndHour']) {
                data['recordsEachDayAndHour'][dayOfMonth][isoDate.getHours()].push(isoDate);
            } else {
                data['recordsEachDayAndHour'][dayOfMonth] = [];
                for (var i=0; i<24; i++) {
                    data['recordsEachDayAndHour'][dayOfMonth][i] = [];
                }
                data['recordsEachDayAndHour'][dayOfMonth][isoDate.getHours()].push(isoDate);
            }

            // sum of each hour of each week
            if (currentWeek in countEachHourOfEachWeek) {
                countEachHourOfEachWeek[currentWeek][isoDate.getHours()]++;
            } else {
                countEachHourOfEachWeek[currentWeek] = [];
                for (var i=0; i<24; i++) {
                    countEachHourOfEachWeek[currentWeek][i] = 0;
                }
                countEachHourOfEachWeek[currentWeek][isoDate.getHours()]++;
            }

            if (isoDate > data['lastRecordedDay']) {
                data['lastRecordedDay'] = isoDate;
            }

            if (isoDate < data['firstRecordedDay']) {
                data['firstRecordedDay'] = isoDate;
            }

            if (isoDate.getFullYear() < data['firstYear']) {
                data['firstYear'] = isoDate.getFullYear();
            }
            if (isoDate.getFullYear() > data['lastYear']) {
                data['lastYear'] = isoDate.getFullYear();
            }

            if (isoDate.getFullYear() === data['firstYear']) {
                //Find first and last month
                if (isoDate.getMonth() < data["firstMonth"]) {
                    data["firstMonth"] = isoDate.getMonth();
                }						
            }
            if (isoDate.getFullYear() === data['lastYear']) {
                if (isoDate.getMonth() > data["lastMonth"]) {
                    data["lastMonth"] = isoDate.getMonth();
                }
            }
        }

        data['byMonth'] = createBarData(countMonth);
        data['byDay'] = createBarData(countWeekday);
        data['byHour'] = createBarData(countHour);
        data['byWeek'] = createBarData(countWeeks);
        data['hourByDay'] = countEachHourOfEachDay;
        data['hourByWeek'] =  countEachHourOfEachWeek;
        data['amountOfEachWeekday'] = getCountOfEachWeekday(data['firstRecordedDay'], data['lastRecordedDay']);
        data['eachDay'] = [];

        for(var i in countEachDay) {
            data['eachDay'].push({
                "date": new Date(i),
                "sum": countEachDay[i]
            });
        }

        for (var i in countEachHourOfEachDay) {
            if (countEachHourOfEachDay[i] > data['maxHourOfDay']) {
                data['maxHourOfDay'] = countEachHourOfEachDay[i];
            }
        }

        console.log(data)
        data['mostInADay'] = d3.max(data['eachDay'],function(d) { return d.sum});
        
        data['totalDays'] = getNumberOfDayBetweenTwoDates(data['firstRecordedDay'], data['lastRecordedDay']);
        data['averagePerHour'] = [];
        for (var hour in countHour) {
            data['averagePerHour'][hour] = (countHour[hour]/data['totalDays']);
        }
        
        data['averageDay'] = (d3.sum(data['eachDay'],function(d) { return d.sum})/data['totalDays']);

        data['averageWorkday'] = (data['byDay'][0].sum + data['byDay'][1].sum + data['byDay'][2].sum +data['byDay'][3].sum + data['byDay'][4].sum) / (data['totalDays']-data['amountOfEachWeekday'][5]-data['amountOfEachWeekday'][6]);
        data['averageWeekend'] = (data['byDay'][5].sum + data['byDay'][6].sum) / (data['amountOfEachWeekday'][5]+data['amountOfEachWeekday'][6]);

        data['averagePerWeekday'] = [];
        for (var i=0;i<7;i++) {
            data['averagePerWeekday'][i] = data['byDay'][i].sum/data['amountOfEachWeekday'][i];
        }

        data["averagePerHourPerWeekday"] = [];
        for (var d in weekday) {
            data["averagePerHourPerWeekday"][d] = [];
            for (var i=0; i<24; i++) {
                data["averagePerHourPerWeekday"][d][i] = countEachHourOfEachWeekday[d][i]/data['amountOfEachWeekday'][d];
            }
        }

        data["averageHourOverAllWeeks"] = [];   
        data["maxHourOverAllWeeks"] = 0;    
        for (var i=0; i<24; i++) {
            var hourSum = 0;
            var numWeeks = 0;
            var currentWeek;
            for (var w in countEachHourOfEachWeek) {                
                hourSum += countEachHourOfEachWeek[w][i];
                numWeeks++;

                if (countEachHourOfEachWeek[w][i] > data["maxHourOverAllWeeks"]) {
                    data["maxHourOverAllWeeks"] = countEachHourOfEachWeek[w][i];
                }
            }            

            data["averageHourOverAllWeeks"][i] = hourSum/numWeeks;
        }

        var firstDate = new Date(data['firstYear'], data['firstMonth'], 1);				
        var lastDate = new Date(data['lastRecordedDay'].getMonth() === 11 ? data['lastYear']+1 : data['lastYear'], data['lastRecordedDay'].getMonth() === 11 ? 0 : (data['lastRecordedDay'].getMonth()+1), 1);

        var calendarObject = new Calendar(data['lastRecordedDay'], countEachDay, data['mostInADay'], data);
        calendarObject.create();

        var timetableObject = new TimeTable(data['lastRecordedDay'], calendarObject.week, data['hourByDay'], calendarObject.month, calendarObject.year, data['maxHourOfDay']);
        timetableObject.create();        

        calendarObject.timeTable = timetableObject;
        timetableObject.calendar = calendarObject;

        var informationPanel = new InformationPanel(data);
        informationPanel.setAverageWorkday();
        informationPanel.setChosenWeekdayAverage(data['lastRecordedDay'].getDay());


        calendarObject.informationPanel = informationPanel;
        timetableObject.informationPanel = informationPanel;

        var dateChart = new DateBarChart(
            data['eachDay'],
            'dateChart', 
            900,
            250,
            {top: 40, right: 60, bottom: 40, left: 40},
            "Observations per day", 
            [firstDate, lastDate],
            'default',
            true,
            {
                "xBarFontSize": "12px",
                "titleFontSize": "15px"
            }
        );
        dateChart.create("Day", "Observations", monthDiff(firstDate, lastDate));
        dateChart.createBrush();

        var monthChart = new NormalBarChart(
            data['byMonth'], 
            'monthBarChart', 
            500, 
            250,
            {top: 40, right: 60, bottom: 40, left: 40},
            "Observations per month", 
            data['byMonth'], 
            'default',
            true,
            {
                "xBarFontSize": "12px",
                "titleFontSize": "15px"
            }
        );
        monthChart.create("Month", "Observations", -1);
        monthChart.addClickEventToUpdateDateChart(dateChart, 'month');
        
        var weekChart = new NormalBarChart(
            data['byWeek'], 
            'weekBarChart', 
            500, 
            250,
            {top: 40, right: 60, bottom: 40, left: 40},
            "Observations per week", 
            data['byWeek'], 
            'default',
            true,
            {
                "xBarFontSize": "12px",
                "titleFontSize": "15px"
            }
        );
        weekChart.create("", "Observations", -1);
        weekChart.rotateTickLabels();

        var weekdayChart = new NormalBarChart(
            data['byDay'], 
            'dayBarChart', 
            500, 
            250,
            {top: 40, right: 60, bottom: 40, left: 40},
            "Observations per weekday",
            data['byDay'], 
            'default',
            true,
            {
                "xBarFontSize": "12px",
                "titleFontSize": "15px"
            }
        );
        weekdayChart.create("Weekday", "Observations", -1);
        childGraphs.push(weekdayChart);
        weekdayChart.addClickEventToUpdateDateChart(dateChart, 'weekday');
        
        var hourChart = new TimeBarChart(
            data['byHour'],
            'hourBarChart',
            500,
            250,
            {top: 40, right: 60, bottom: 40, left: 40},
            "Observations per hour",
            [0,24],
            true,
            {
                "xBarFontSize": "12px",
                "titleFontSize": "15px"
            }
        );
            
        hourChart.create("Hour", "Observations", -1);
        childGraphs.push(hourChart);
    });
}

function sumData(instance, sumArray) {
    if (instance in sumArray) {
        sumArray[instance]++;
    } else {
        sumArray[instance] = 1;
    }
}

function createBarData(countArray) {
    var barData = [];
    for (var i in countArray) {
        barData.push({
                "type": i,
                "sum": countArray[i]
        });
    }
    return barData;
}	

function updateChildGraphs(firstDate, lastDate) {
    setClockTo(firstDate, [0,0,0]);
    setClockTo(lastDate, [23,59,59]);
    document.getElementById("firstDate").innerHTML = weekday[firstDate.getDay() === 0 ? 6 : (firstDate.getDay()-1)] + " " + month[firstDate.getMonth()] + " " + firstDate.getDate() + " " + firstDate.getFullYear();
    document.getElementById("lastDate").innerHTML = weekday[lastDate.getDay() === 0 ? 6 : (lastDate.getDay()-1)] + " " + month[lastDate.getMonth()] + " " + lastDate.getDate() + " " + lastDate.getFullYear();;
    if (childGraphs.length > 0) {
        var countWeekday = [];
        var countHour = [];

        for (var i=0; i<24;i++) {
            countHour[i] = 0;
        }

        for (var instance in unFilteredData) {
            var date = Object.keys(unFilteredData[instance])[0]
            if (date !== "date") {
                continue;
            }

            var isoDate = strictIsoParse(unFilteredData[instance][date]);
            if (firstDate > isoDate || lastDate < isoDate) {
                continue;
            }

            var currentDay;
            if (isoDate.getDay() === 0) {
                currentDay = weekday[6];
            } else {
                currentDay = weekday[(isoDate.getDay()-1)];
            }
            sumData(currentDay, countWeekday);

            sumData(isoDate.getHours(), countHour);
        }
        
        var weekdayData = createBarData(countWeekday);
        
        var maxVal = 0;
        for (var i in countWeekday) {
            if (countWeekday[i] > maxVal) {
                maxVal = countWeekday[i];
            }
        }

        childGraphs[0].yTicks = maxVal;
        childGraphs[0].updateGraph(weekdayData);
        var hourData = createBarData(countHour);
        childGraphs[1].yTicks = d3.max(countHour);
        childGraphs[1].updateGraph(hourData);

    }
}



function getSpecificWeekdayData(day) {
    var days = [];
    for (var instance in unFilteredData) {
        var date = Object.keys(unFilteredData[instance])[0]
        if (date !== "date") {
            continue;
        }
        
        var isoDate = strictIsoParse(unFilteredData[instance][date]);
        var isoDay = isoDate.getDay() === 0 ? 6 : isoDay = isoDate.getDay()-1;
        if (isoDay === day) {
            days.push(isoDate);
        }
    }
    return days;
}

function updateChildGraphsWithWeekdayData(weekdayIndex) {
    document.getElementById("firstDate").innerHTML = "All " + weekday[weekdayIndex] + "s";
    document.getElementById("lastDate").innerHTML = "All " + weekday[weekdayIndex] + "s";
    if (childGraphs.length > 0) {
        var countWeekday = [];
        var countHour = [];

        for (var i=0; i<24;i++) {
            countHour[i] = 0;
        }

        for (var instance in unFilteredData) {
            var date = Object.keys(unFilteredData[instance])[0]
            if (date !== "date") {
                continue;
            }

            var isoDate = strictIsoParse(unFilteredData[instance][date]);
            var isoDay = isoDate.getDay() === 0 ? 6 : isoDay = isoDate.getDay()-1;

            if (weekdayIndex !== isoDay) {
                continue;
            }

            var currentDay = weekday[isoDay];
            
            sumData(currentDay, countWeekday);

            sumData(isoDate.getHours(), countHour);
        }

        var weekdayData = createBarData(countWeekday);
        
        var maxVal = 0;
        for (var i in countWeekday) {
            if (countWeekday[i] > maxVal) {
                maxVal = countWeekday[i];
            }
        }

        childGraphs[0].yTicks = maxVal;
        childGraphs[0].updateGraph(weekdayData);
        var hourData = createBarData(countHour);
        childGraphs[1].yTicks = d3.max(countHour);
        childGraphs[1].updateGraph(hourData);

    }
}

function datasetChange() {
    var dataset = document.getElementById("datasets").value;
        
    var graphs = document.getElementsByClassName("graph");
    for (var i in graphs) {				
        while (graphs[i].firstChild) {
            graphs[i].removeChild(graphs[i].firstChild);
        }
    }

    var calendar = document.getElementById("calendar");			
    while (calendar.firstChild) {
        calendar.removeChild(calendar.firstChild);
    }

    var timetable = document.getElementById("timetable");			
    while (timetable.firstChild) {
        timetable.removeChild(timetable.firstChild);
    }

    var barChartBreakdown = document.getElementById("minuteBreakdown");			
    while (barChartBreakdown.firstChild) {
        barChartBreakdown.removeChild(barChartBreakdown.firstChild);
    }
    
    document.getElementById("averageHourPerWeekday").innerText = "";

    getAnnotations(dataset);
    //createVisualization(dataset);
}

getAnnotations('ptsd_filtered_no_single.csv');
