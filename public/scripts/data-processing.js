var unFilteredData;
var invalidObservations = [];

//2016-09-05T18:13:46.105Z
var strictIsoParse;

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
            processData(dataset);
        }
    };
    xmlhttp.open("GET", ("/annotations?dataset="+dataset), true);
    xmlhttp.send();
}

function processData(dataset) {    
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
    data['allRecordsEachDayAndHour'] = [];

    data['filteredData'] = [];

    data['invalidatedObservations'] = [];
    data['singleInvalidatedObservations'] = [];
    data['hourToMarkAsChanged'] = [];

    var lastLoopedDay;
    var lastRecordDate = new Date("1971-1-1");
    
    numberOfMonths = [];

    
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

        if (!rawData[instance][date].includes("-")) {
            strictIsoParse = d3.utcParse("%Y%m%dT%H%M%SZ");
        } else {
            strictIsoParse = d3.utcParse("%Y-%m-%dT%H:%M:%S.%LZ");
        }

        var isoDate = strictIsoParse(rawData[instance][date]);
        if (!isoDate || isoDate === null || isoDate === "") {
            continue;
        }        

        var dayOfMonth = isoDate.getFullYear() + "-" + (isoDate.getMonth()+1) + "-" + isoDate.getDate();
        var hourOfDay = dayOfMonth + "-" +isoDate.getHours();
        var millisecondString = hourOfDay + "-" +isoDate.getMilliseconds();

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

        if (dayOfMonth in data['allRecordsEachDayAndHour']) {
            data['allRecordsEachDayAndHour'][dayOfMonth][isoDate.getHours()].push(isoDate);
        } else {
            data['allRecordsEachDayAndHour'][dayOfMonth] = [];
            for (var i=0; i<24; i++) {
                data['allRecordsEachDayAndHour'][dayOfMonth][i] = [];
            }
            data['allRecordsEachDayAndHour'][dayOfMonth][isoDate.getHours()].push(isoDate);
        }

        if (millisecondString in invalidObservations) {
            data['singleInvalidatedObservations'][millisecondString] = invalidObservations[millisecondString];
            data['hourToMarkAsChanged'][hourOfDay] = true;
            continue;
        }        

        if (dayOfMonth in invalidObservations) {
            if (!(dayOfMonth in data['invalidatedObservations'])) {
                data['invalidatedObservations'][dayOfMonth] = 0;
            }
            data['invalidatedObservations'][dayOfMonth]++;
            
            if (!(hourOfDay in data['invalidatedObservations'])) {
                data['invalidatedObservations'][hourOfDay] = 0;
            }
            data['invalidatedObservations'][hourOfDay]++;
            continue;
        }
        
        if (hourOfDay in invalidObservations) {
            if (!(hourOfDay in data['invalidatedObservations'])) {
                data['invalidatedObservations'][hourOfDay] = 0;
            }
            data['invalidatedObservations'][hourOfDay]++;
            continue;
        }
        var diff = isoDate.getTime() - lastRecordDate.getTime();
        if (diff > 4000) {
            data['filteredData'].push(isoDate);
            lastRecordDate = isoDate;	
        }        

        if (lastLoopedDay) {
            var tempDate = new Date(isoDate.getTime());
            tempDate.setHours(0,0,0,0);
            if ((tempDate.getTime() - lastLoopedDay.getTime()) > 86400000) {
                while(lastLoopedDay.getTime() < tempDate.getTime()) {
                    var tempDay = lastLoopedDay.getFullYear() + "-" + (lastLoopedDay.getMonth()+1) + "-" + lastLoopedDay.getDate();
                    var tempWeek = lastLoopedDay.getWeekNumber() + "-" + lastLoopedDay.getFullYear();
                    if (!(tempDay in countEachDay)) {
                        countEachDay[tempDay] = 0;
                    }

                    if (!(tempWeek in countWeeks)) {
                        countWeeks[tempWeek] = 0;
                    }
                    lastLoopedDay.setDate(lastLoopedDay.getDate() + 1);
                }
            }
        }

        var currentWeek = isoDate.getWeekNumber() + "-" + isoDate.getFullYear();
        sumData(currentWeek, countWeeks);

        var currentMonth = month[isoDate.getMonth()]
        sumData(currentMonth, countMonth);

        var currentDay = isoDate.getDay() === 0 ? weekday[6] : weekday[(isoDate.getDay()-1)];

        sumData(currentDay, countWeekday);
        sumData(isoDate.getHours(), countHour);
                
        if (dayOfMonth in countEachDay) {
            countEachDay[dayOfMonth]++;
        } else {
            countEachDay[dayOfMonth] = 1;					
        }

        // sum of each hour of each day        
        if (hourOfDay in countEachHourOfEachDay) {
            countEachHourOfEachDay[hourOfDay]++;
        } else {
            countEachHourOfEachDay[hourOfDay] = 1;
        }

        // sum of each hour of each weekday
        countEachHourOfEachWeekday[isoDate.getDay() === 0 ? 6 : (isoDate.getDay()-1)][isoDate.getHours()]++; 

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

        lastLoopedDay = new Date(isoDate.getTime());
        lastLoopedDay.setHours(0,0,0,0);
    }    
 
    data['byMonth'] = createBarData(countMonth);
    data['byDay'] = createBarData(countWeekday);
    data['byHour'] = createBarData(countHour);
    data['byWeek'] = createBarData(countWeeks);
    data['sumOfEachMonth'] = countMonth;
    data['sumOfEachWeek'] = countWeeks;
    data['sumOfEachDay'] = countEachDay;
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
    
    data["maxWeek"] = 0;
    var weekSum = 0;
    var amountOfWeeks = 0;
    for (var i in countWeeks) {
        if (countWeeks[i] > data["maxWeek"]) {
            data["maxWeek"] = countWeeks[i];
        }
        weekSum += countWeeks[i];
        amountOfWeeks++;
    }
    data["averageWeek"] = (weekSum/amountOfWeeks);
    
    data["averageDayPerMonth"] = [];
    data["averageDayEachMonth"] = [];
    data["maxAverageDayPerMonth"] = 0;
    var amountOfDaysInFirstMonth = daysInMonth(data['firstRecordedDay'].getMonth(), data['firstRecordedDay'].getFullYear()) - data['firstRecordedDay'].getDate()+1;
    var amountOfDaysInLastMonth = data['lastRecordedDay'].getDate();
    var cnt = 0;    
    for (var i in countMonth) {
        var sum = 0;
        if (cnt === 0) {
            sum = +(countMonth[i] / amountOfDaysInFirstMonth).toFixed(2);
        } else if (cnt === (Object.keys(countMonth).length-1)) {
            sum = +(countMonth[i] / amountOfDaysInLastMonth).toFixed(2);            
        } else {
            sum= +(countMonth[i] / daysInMonth((month.indexOf(i)+1), data["firstYear"])).toFixed(2);
        }
        
        if (data["maxAverageDayPerMonth"] < sum) {
            data["maxAverageDayPerMonth"] = Math.floor(sum);
        }

        data["averageDayEachMonth"][i] = sum;

        data["averageDayPerMonth"].push({
            sum: sum,
            type: i
        });
        cnt++;
    }

    data["daysInEachWeek"] = getDaysInEachWeek(data['firstRecordedDay'], data['lastRecordedDay']);
}

function getDaysInEachWeek(firstDay, lastDay) {
    var currentDay = new Date(firstDay.getTime());
    currentDay.setHours(0,0,0,0);
    weekArray = [];
    while (currentDay.getTime() < lastDay.getTime()) {
        var weekString = currentDay.getWeekNumber() +"-"+ currentDay.getFullYear();
        if (weekString in weekArray) {
            if (weekArray[weekString]["firstDay"].getTime() > currentDay.getTime()) {
                weekArray[weekString]["firstDay"] = new Date(currentDay.getTime());
            }

            if (weekArray[weekString]["lastDay"].getTime() < currentDay.getTime()) {
                weekArray[weekString]["lastDay"] = new Date(currentDay.getTime());
            }
        } else {
            weekArray[weekString] = [];
            weekArray[weekString]["firstDay"] = new Date(currentDay.getTime());
            weekArray[weekString]["lastDay"] = new Date(currentDay.getTime());
        }

        currentDay.setDate(currentDay.getDate() + 1);
    }

    return weekArray;
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

function checkForChosenDataset() {
    var possibleDataset = window.localStorage.getItem('dataset');
    console.log(possibleDataset)
    if (possibleDataset && possibleDataset !== "" && possibleDataset !== "custom") {
        document.getElementById("datasets").value = possibleDataset;
    } else if (possibleDataset === 'custom') {
        var customDateString = parseInt(window.localStorage.getItem('custom-date'));        
        var timeNow = new Date();
        if ((timeNow.getTime() - customDateString) < 1800000) {
            document.getElementById("datasets").value = possibleDataset;
            rawData = JSON.parse(window.localStorage.getItem('custom-data')).data
            annotations = [];
            invalidObservations = [];
            processData();
            createVisualizations();
            window.localStorage.setItem('custom-date', timeNow.getTime());
        } else {
            window.localStorage.setItem('custom-data', "");
            window.localStorage.setItem('custom-date', "");
            window.localStorage.setItem('dataset', "");				  
        }
    }
}