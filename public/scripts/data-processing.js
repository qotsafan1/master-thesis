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

function processData(timezone) {    
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
    data['totalDaysWithObservations'] = 0;

    var lastLoopedDay;
    var lastRecordDate = new Date("1971-1-1");
    
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
    var countEachMonth = [];
    var countEachHourOfEachWeek = [];
    var countEachHourOfEachDay = [];
    var countEachHourOfEachWeekday = [];
    var countStackedTwoHoursOfEachDay = [];
    var countStackedFourHoursOfEachDay = [];
    var countStackedSixHoursOfEachDay = [];
    var countStackedEightHoursOfEachDay = [];

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

        if (timezone === "2" && "timezone" in rawData[instance]) {
            var tzString = rawData[instance]["timezone"];
            if (tzString.includes("+")) {
                isoDate.setUTCHours(isoDate.getUTCHours() + parseInt(tzString.slice(1,3)));
            } else if (tzString.includes("-")) {
                isoDate.setUTCHours(isoDate.getUTCHours() - parseInt(tzString.slice(1,3)));
            }
        }

        if (timezone === "1") {
            thisTZDate = new Date(isoDate.getTime())
            isoDate.setUTCMinutes(isoDate.getUTCMinutes() + (-1*thisTZDate.getTimezoneOffset()));
        }


        var dayOfMonth = isoDate.getUTCFullYear() + "-" + (isoDate.getUTCMonth()+1) + "-" + isoDate.getUTCDate();
        var hourOfDay = dayOfMonth + "-" +isoDate.getUTCHours();
        var millisecondString = hourOfDay + "-" +isoDate.getUTCMilliseconds();

        if (isoDate > data['lastRecordedDay']) {
            data['lastRecordedDay'] = isoDate;
        }

        if (isoDate < data['firstRecordedDay']) {
            data['firstRecordedDay'] = isoDate;            
        }

        if (isoDate.getUTCFullYear() < data['firstYear']) {
            data['firstYear'] = isoDate.getUTCFullYear();
        }
        if (isoDate.getUTCFullYear() > data['lastYear']) {
            data['lastYear'] = isoDate.getUTCFullYear();
        }

        if (isoDate.getUTCFullYear() === data['firstYear']) {
            //Find first and last month
            if (isoDate.getUTCMonth() < data["firstMonth"]) {
                data["firstMonth"] = isoDate.getUTCMonth();
            }						
        }
        if (isoDate.getUTCFullYear() === data['lastYear']) {
            if (isoDate.getUTCMonth() > data["lastMonth"]) {
                data["lastMonth"] = isoDate.getUTCMonth();
            }
        }

        if (dayOfMonth in data['allRecordsEachDayAndHour']) {
            data['allRecordsEachDayAndHour'][dayOfMonth][isoDate.getUTCHours()].push(isoDate);
        } else {
            data['totalDaysWithObservations']++;
            data['allRecordsEachDayAndHour'][dayOfMonth] = [];
            for (var i=0; i<24; i++) {
                data['allRecordsEachDayAndHour'][dayOfMonth][i] = [];
            }
            data['allRecordsEachDayAndHour'][dayOfMonth][isoDate.getUTCHours()].push(isoDate);
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

        // count days and weeks that don't appear in dataset
        if (lastLoopedDay) {
            var tempDate = new Date(isoDate.getTime());
            tempDate.setUTCHours(0,0,0,0);
            if ((tempDate.getTime() - lastLoopedDay.getTime()) > 86400000) {
                while(lastLoopedDay.getTime() < tempDate.getTime()) {
                    var tempDay = lastLoopedDay.getUTCFullYear() + "-" + (lastLoopedDay.getUTCMonth()+1) + "-" + lastLoopedDay.getUTCDate();
                    var tempWeek = lastLoopedDay.getWeekNumber() + "-" + lastLoopedDay.getUTCFullYear();
                    if (!(tempDay in countEachDay)) {
                        countEachDay[tempDay] = 0;
                    }

                    if (!(tempWeek in countWeeks)) {
                        countWeeks[tempWeek] = 0;
                    }
                    lastLoopedDay.setUTCDate(lastLoopedDay.getUTCDate() + 1);
                }
            }
        }

        // calculate stacked bars
        if (!(dayOfMonth in countStackedTwoHoursOfEachDay)) {
            countStackedTwoHoursOfEachDay[dayOfMonth] = [];
            countStackedTwoHoursOfEachDay[dayOfMonth][0] = 0;
            countStackedTwoHoursOfEachDay[dayOfMonth][1] = 0;
        }

        if (isoDate.getUTCHours() < 12) {
            countStackedTwoHoursOfEachDay[dayOfMonth][0]++;
        } else {
            countStackedTwoHoursOfEachDay[dayOfMonth][1]++;
        }

        if (!(dayOfMonth in countStackedFourHoursOfEachDay)) {
            countStackedFourHoursOfEachDay[dayOfMonth] = [];
            for (var i=0; i<4; i++) {
                countStackedFourHoursOfEachDay[dayOfMonth][i] = 0;
            }
        }
        if (isoDate.getUTCHours() < 6) {
            countStackedFourHoursOfEachDay[dayOfMonth][0]++;
        } else if (isoDate.getUTCHours() >= 6 && isoDate.getUTCHours() < 12) {
            countStackedFourHoursOfEachDay[dayOfMonth][1]++;
        } else if (isoDate.getUTCHours() >= 12 && isoDate.getUTCHours() < 18) {
            countStackedFourHoursOfEachDay[dayOfMonth][2]++;
        } else {
            countStackedFourHoursOfEachDay[dayOfMonth][3]++;
        }
        
        // calculate stacked bars
        if (!(dayOfMonth in countStackedSixHoursOfEachDay)) {
            countStackedSixHoursOfEachDay[dayOfMonth] = [];
            for (var i=0; i<6; i++) {
                countStackedSixHoursOfEachDay[dayOfMonth][i] = 0;
            }
        }
        if (isoDate.getUTCHours() < 4) {
            countStackedSixHoursOfEachDay[dayOfMonth][0]++;
        } else if (isoDate.getUTCHours() >= 4 && isoDate.getUTCHours() < 8) {
            countStackedSixHoursOfEachDay[dayOfMonth][1]++;
        } else if (isoDate.getUTCHours() >= 8 && isoDate.getUTCHours() < 12) {
            countStackedSixHoursOfEachDay[dayOfMonth][2]++;
        } else if (isoDate.getUTCHours() >= 12 && isoDate.getUTCHours() < 16) {
            countStackedSixHoursOfEachDay[dayOfMonth][3]++;
        } else if (isoDate.getUTCHours() >= 16 && isoDate.getUTCHours() < 20) {
            countStackedSixHoursOfEachDay[dayOfMonth][4]++;
        } else {
            countStackedSixHoursOfEachDay[dayOfMonth][5]++;
        }

        // calculate stacked bars
        if (!(dayOfMonth in countStackedEightHoursOfEachDay)) {
            countStackedEightHoursOfEachDay[dayOfMonth] = [];
            for (var i=0; i<8; i++) {
                countStackedEightHoursOfEachDay[dayOfMonth][i] = 0;
            }
        }
        if (isoDate.getUTCHours() < 3) {
            countStackedEightHoursOfEachDay[dayOfMonth][0]++;
        } else if (isoDate.getUTCHours() >= 3 && isoDate.getUTCHours() < 6) {
            countStackedEightHoursOfEachDay[dayOfMonth][1]++;
        } else if (isoDate.getUTCHours() >= 6 && isoDate.getUTCHours() < 9) {
            countStackedEightHoursOfEachDay[dayOfMonth][2]++;
        } else if (isoDate.getUTCHours() >= 9 && isoDate.getUTCHours() < 12) {
            countStackedEightHoursOfEachDay[dayOfMonth][3]++;
        } else if (isoDate.getUTCHours() >= 12 && isoDate.getUTCHours() < 15) {
            countStackedEightHoursOfEachDay[dayOfMonth][4]++;
        } else if (isoDate.getUTCHours() >= 15 && isoDate.getUTCHours() < 18) {
            countStackedEightHoursOfEachDay[dayOfMonth][5]++;
        } else if (isoDate.getUTCHours() >= 18 && isoDate.getUTCHours() < 21) {
            countStackedEightHoursOfEachDay[dayOfMonth][6]++;
        } else {
            countStackedEightHoursOfEachDay[dayOfMonth][7]++;
        }

        var currentWeek = isoDate.getWeekNumber() + "-" + isoDate.getUTCFullYear();
        if (isoDate.getWeekNumber() === 52 && isoDate.getUTCDate() < 7) {
            var possibleDifferentWeek = isoDate.getWeekNumber() + "-" + (isoDate.getUTCFullYear()-1);
            if (possibleDifferentWeek in countWeeks) {
                currentWeek = possibleDifferentWeek;
            }
        }
        sumData(currentWeek, countWeeks);

        var currentMonth = month[isoDate.getUTCMonth()]
        sumData(currentMonth, countMonth);

        sumData((isoDate.getUTCMonth()+"-"+isoDate.getUTCFullYear()), countEachMonth);

        var currentDay = isoDate.getUTCDay() === 0 ? weekday[6] : weekday[(isoDate.getUTCDay()-1)];

        sumData(currentDay, countWeekday);
        sumData(isoDate.getUTCHours(), countHour);
                
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
        countEachHourOfEachWeekday[isoDate.getUTCDay() === 0 ? 6 : (isoDate.getUTCDay()-1)][isoDate.getUTCHours()]++; 

        if (dayOfMonth in data['recordsEachDayAndHour']) {
            data['recordsEachDayAndHour'][dayOfMonth][isoDate.getUTCHours()].push(isoDate);
        } else {
            data['recordsEachDayAndHour'][dayOfMonth] = [];
            for (var i=0; i<24; i++) {
                data['recordsEachDayAndHour'][dayOfMonth][i] = [];
            }
            data['recordsEachDayAndHour'][dayOfMonth][isoDate.getUTCHours()].push(isoDate);
        }

        // sum of each hour of each week
        if (currentWeek in countEachHourOfEachWeek) {
            countEachHourOfEachWeek[currentWeek][isoDate.getUTCHours()]++;
        } else {
            countEachHourOfEachWeek[currentWeek] = [];
            for (var i=0; i<24; i++) {
                countEachHourOfEachWeek[currentWeek][i] = 0;
            }
            countEachHourOfEachWeek[currentWeek][isoDate.getUTCHours()]++;
        }        

        lastLoopedDay = new Date(isoDate.getTime());
        lastLoopedDay.setUTCHours(0,0,0,0);
    }

    data['firstObservation'] = data['firstRecordedDay'];
    data['firstRecordedDay'] = new Date(data['firstRecordedDay'].getTime());
    data['firstRecordedDay'].setUTCHours(0,0,0,0);
    data['lastObservation'] = data['lastRecordedDay'];
    data['lastRecordedDay'] = new Date(data['lastRecordedDay'].getTime());
    data['lastRecordedDay'].setUTCHours(23,59,59);
    data['byMonth'] = createBarData(countMonth);
    data['byDay'] = createBarData(countWeekday);
    data['byHour'] = createBarData(countHour);
    data['byWeek'] = createBarData(countWeeks);
    data['sumOfEachMonth'] = countMonth;
    data['sumOfEachYearMonth'] = createBarData(countEachMonth);
    data['sumOfEachWeek'] = countWeeks;
    data['sumOfEachDay'] = countEachDay;
    data['hourByDay'] = countEachHourOfEachDay;
    data['hourByWeek'] =  countEachHourOfEachWeek;
    data['amountOfEachWeekday'] = getCountOfEachWeekday(data['firstRecordedDay'], data['lastRecordedDay']);
    data['eachDay'] = [];

    for(var i in countEachDay) {
        data['eachDay'].push({
            "date": getCorrectUTCDate(i),
            "sum": countEachDay[i]
        });
    }

    for (var i in countEachHourOfEachDay) {
        if (countEachHourOfEachDay[i] > data['maxHourOfDay']) {
            data['maxHourOfDay'] = countEachHourOfEachDay[i];
        }
    }

    data["stackedHoursEachDay"] = [];
    data["stackedHoursEachDay"][0] = [];
    data["stackedHoursEachDay"][1] = [];
    data["stackedHoursEachDay"][2] = [];
    data["stackedHoursEachDay"][3] = [];
    for (var i in countStackedTwoHoursOfEachDay) {
        data["stackedHoursEachDay"][0].push({
            "date": getCorrectUTCDate(i),
            "00-12": countStackedTwoHoursOfEachDay[i][0],
            "12-00": countStackedTwoHoursOfEachDay[i][1]
        });
    }
    for (var i in countStackedFourHoursOfEachDay) {
        data["stackedHoursEachDay"][1].push({
            "date": getCorrectUTCDate(i),
            "00-06": countStackedFourHoursOfEachDay[i][0],
            "06-12": countStackedFourHoursOfEachDay[i][1],
            "12-18": countStackedFourHoursOfEachDay[i][2],
            "18-00": countStackedFourHoursOfEachDay[i][3]
        });
    }
    for (var i in countStackedSixHoursOfEachDay) {
        data["stackedHoursEachDay"][2].push({
            "date": getCorrectUTCDate(i),
            "00-04": countStackedSixHoursOfEachDay[i][0],
            "04-08": countStackedSixHoursOfEachDay[i][1],
            "08-12": countStackedSixHoursOfEachDay[i][2],
            "12-16": countStackedSixHoursOfEachDay[i][3],
            "16-20": countStackedSixHoursOfEachDay[i][4],
            "20-00": countStackedSixHoursOfEachDay[i][5]
        });
    }
    for (var i in countStackedEightHoursOfEachDay) {
        data["stackedHoursEachDay"][3].push({
            "date": getCorrectUTCDate(i),
            "00-03": countStackedEightHoursOfEachDay[i][0],
            "03-06": countStackedEightHoursOfEachDay[i][1],
            "06-09": countStackedEightHoursOfEachDay[i][2],
            "09-12": countStackedEightHoursOfEachDay[i][3],
            "12-15": countStackedEightHoursOfEachDay[i][4],
            "15-18": countStackedEightHoursOfEachDay[i][5],
            "18-21": countStackedEightHoursOfEachDay[i][6],
            "21-24": countStackedEightHoursOfEachDay[i][7]
        });
    }
    data["sumStackedHoursEachDay"] = []
    data["sumStackedHoursEachDay"][0] = countStackedFourHoursOfEachDay;
    data["sumStackedHoursEachDay"][1] = countStackedSixHoursOfEachDay;
    data["sumStackedHoursEachDay"][2] = countStackedTwoHoursOfEachDay;
    data["sumStackedHoursEachDay"][3] = countStackedEightHoursOfEachDay;

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
    var amountOfDaysInFirstMonth = daysInMonth(data['firstRecordedDay'].getUTCMonth(), data['firstRecordedDay'].getUTCFullYear()) - data['firstRecordedDay'].getUTCDate()+1;
    var amountOfDaysInLastMonth = data['lastRecordedDay'].getUTCDate();
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

    data['comparingWeeks'] = [];
    var indexOfThisWeek = (data['byWeek'].length-1);
    data['comparingWeeks'].push({
        "type": "This week",
        "sum": data['byWeek'][indexOfThisWeek].sum
    });
    if (data['byWeek'].length > 2) {
        data['comparingWeeks'].push({
            "type": "Last week",
            "sum": data['byWeek'][indexOfThisWeek-1].sum
        });
    }

    if (data['byWeek'].length > 3) {
        var avgLastTwoWeeks = (data['byWeek'][indexOfThisWeek-1].sum + data['byWeek'][indexOfThisWeek-2].sum)/2;
        data['comparingWeeks'].push({
            "type": "Avg last two weeks",
            "sum": avgLastTwoWeeks
        });
    }

    if (data['byWeek'].length > 5) {
        var avgLastFourWeeks = 0;
        for(var i=indexOfThisWeek-1; i>indexOfThisWeek-5; i--) {
            avgLastFourWeeks += data['byWeek'][i].sum; 
        }
        avgLastFourWeeks = avgLastFourWeeks/4;
        data['comparingWeeks'].push({
            "type": "Avg last four weeks",
            "sum": avgLastFourWeeks
        });
    }

    if (data['byWeek'].length > 9) {
        var avgLastEightWeeks = 0;
        for(var i=indexOfThisWeek-1; i>indexOfThisWeek-9; i--) {
            avgLastEightWeeks += data['byWeek'][i].sum; 
        }
        avgLastEightWeeks = avgLastEightWeeks/8;
        data['comparingWeeks'].push({
            "type": "Avg last eight weeks",
            "sum": avgLastEightWeeks
        });
    }

    if (data['byWeek'].length > 13) {
        var avgLastTwelveWeeks = 0;
        for(var i=indexOfThisWeek-1; i>indexOfThisWeek-13; i--) {
            avgLastTwelveWeeks += data['byWeek'][i].sum; 
        }
        avgLastTwelveWeeks = avgLastTwelveWeeks/12;
        data['comparingWeeks'].push({
            "type": "Avg last twelve weeks",
            "sum": avgLastTwelveWeeks
        });
    }

    data['comparingWeeks'].push({
        "type": "Average week",
        "sum": data['averageWeek'].toFixed(2)
    });
    
    data["trivia"] = [];
    data["trivia"].push({
        "key": "First observation",
        "value": data["firstObservation"].getUTCDate() 
            + " " + month[data["firstObservation"].getUTCMonth()] 
            + " " + data["firstObservation"].getUTCFullYear()
            + " " + (data["firstObservation"].getUTCHours() < 10 ? "0" : "") + data["firstObservation"].getUTCHours() 
            +":"+ (data["firstObservation"].getUTCMinutes() < 10 ? "0" : "") + data["firstObservation"].getUTCMinutes() 
            +":"+ (data["firstObservation"].getUTCSeconds() < 10 ? "0" : "") + data["firstObservation"].getUTCSeconds()
    });
    data["trivia"].push({
        "key": "Last observation",
        "value": data["lastObservation"].getUTCDate() 
        + " " + month[data["lastObservation"].getUTCMonth()] 
        + " " + data["lastObservation"].getUTCFullYear()
        + " " + (data["lastObservation"].getUTCHours() < 10 ? "0" : "") + data["lastObservation"].getUTCHours() 
            +":"+ (data["lastObservation"].getUTCMinutes() < 10 ? "0" : "") + data["lastObservation"].getUTCMinutes() 
            +":"+ (data["lastObservation"].getUTCSeconds() < 10 ? "0" : "") + data["lastObservation"].getUTCSeconds()
    });
    data["trivia"].push({
        "key": "Total days",
        "value": data["totalDays"]
    });    
    data["trivia"].push({
        "key": "Total weeks",
        "value": data["byWeek"].length
    });
    data["trivia"].push({
        "key": "Total months",
        "value": data["sumOfEachYearMonth"].length
    });
    data["trivia"].push({
        "key": "Total observations",
        "value": rawData.length
    });
    data["trivia"].push({
        "key": "Days with observations",
        "value": data["totalDaysWithObservations"] 
            + " (" + ((data["totalDaysWithObservations"]/data["totalDays"])*100).toFixed(2) + "% of total days)"
    });
    data["trivia"].push({
        "key": "Days without observations",
        "value": data["totalDays"] - data["totalDaysWithObservations"] 
            + " (" + (((data["totalDays"] - data["totalDaysWithObservations"])/data["totalDays"])*100).toFixed(2) + "% of total days)"
    });
    data["trivia"].push({
        "key": "Average observations per day",
        "value": data["averageDay"].toFixed(2)
    });
    data["trivia"].push({
        "key": "Average observations per week",
        "value": data["averageWeek"].toFixed(2)
    });
}

function getDaysInEachWeek(firstDay, lastDay) {
    var currentDay = new Date(firstDay.getTime());
    currentDay.setUTCHours(0,0,0,0);
    weekArray = [];
    while (currentDay.getTime() < lastDay.getTime()) {
        var weekString = currentDay.getWeekNumber() +"-"+ currentDay.getUTCFullYear();
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

        currentDay.setUTCDate(currentDay.getUTCDate() + 1);
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
            var tz = document.getElementById("timezone");
			processData(tz.value);            
            createVisualizations();
            window.localStorage.setItem('custom-date', timeNow.getTime());
        } else {
            window.localStorage.setItem('custom-data', "");
            window.localStorage.setItem('custom-date', "");
            window.localStorage.setItem('dataset', "");				  
        }
    }
}