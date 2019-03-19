function InformationPanel(data) {
    this.data = data;
    var averageDay = document.getElementById("averageDay");
    averageDay.innerText = "- per day is " + (data["averageDay"].toFixed(2)) + ".";
}

InformationPanel.prototype.updateAverageDay = function(instances) {
    this.resetAverageHour();
    var averageDay = document.getElementById("averageDay");
    
    if (isNaN(instances) || instances === this.data["averageDay"].toFixed(2)) {
        averageDay.innerText = "- per day is " + (data["averageDay"].toFixed(2)) + ".";
    } else {
        averageDay.innerText = "- per day is " 
        + (this.data["averageDay"].toFixed(2) + ". Chosen day is " 
            + this.calculatePercentage(this.data["averageDay"].toFixed(2), instances)
            + "% " + (this.data["averageDay"].toFixed(2) < instances ? "more." : "less."));
    }
}
    
InformationPanel.prototype.updateAverageHour = function(chosenHourNumber, wday, chosenHour) {
    var averageHourPerWeekday = document.getElementById("averageHourPerWeekday");
    
    averageHourPerWeekday.innerText = "- on " 
        + weekday[wday] + "s between " + chosenHour + ":00 - " + (parseInt(chosenHour)+1) + ":00 is " 
        + this.data["averagePerHourPerWeekday"][wday][chosenHour].toFixed(3)  + ".";
}

InformationPanel.prototype.setAverageWorkday = function() {
    var averageWorkday = document.getElementById("averageWorkday");
    averageWorkday.innerText = "- per workday is " 
        + this.data["averageWorkday"].toFixed(3) + " vs. " 
        + this.data["averageWeekend"].toFixed(3) + " on weekends.";
}

InformationPanel.prototype.setChosenWeekdayAverage = function(day) {
    var averageChosenWeekday = document.getElementById("averagePerWeekday");
    averageChosenWeekday.innerText = "- on " + weekday[day] + "s is " 
        + this.data["averagePerWeekday"][day].toFixed(3);
}

InformationPanel.prototype.calculatePercentage = function(orginal, numToCompare) {
    if (numToCompare < orginal) {
        return (((orginal-numToCompare)/orginal)*100).toFixed(2);
    } else if (numToCompare > orginal) {
        return (((numToCompare-orginal)/orginal)*100).toFixed(2);
    } else {
       return 0;
    }
}

InformationPanel.prototype.resetAverageHour = function() {
    var averageHourPerWeekday = document.getElementById("averageHourPerWeekday");
    averageHourPerWeekday.innerText = "";
}