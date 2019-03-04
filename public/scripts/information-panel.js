function InformationPanel(data) {
    this.data = data;
    var averageDay = document.getElementById("averageDay");
    averageDay.innerText = "Average instance per day is " + (data["averageDay"].toFixed(2)) + ".";
}

InformationPanel.prototype.updateAverageDay = function(chosenDayNumber) {
    this.resetAverageHour();
    var averageDay = document.getElementById("averageDay");
    
    if (isNaN(chosenDayNumber) || chosenDayNumber === this.data["averageDay"].toFixed(2)) {
        averageDay.innerText = "Average instance per day is " + (data["averageDay"].toFixed(2)) + ".";
    } else {
        averageDay.innerText = "Average instance per day is " 
        + (this.data["averageDay"].toFixed(2) + ". Chosen day is " 
            + this.calculatePercentage(this.data["averageDay"].toFixed(2), chosenDayNumber)
            + "% " + (this.data["averageDay"].toFixed(2) < chosenDayNumber ? "more." : "less."));
    }
}
    
InformationPanel.prototype.updateAverageHour = function(chosenHourNumber, wday, chosenHour) {
    var averageHourPerWeekday = document.getElementById("averageHourPerWeekday");
    
    averageHourPerWeekday.innerText = "Average instance on " 
        + weekday[wday] + "s between " + chosenHour + ":00 - " + (parseInt(chosenHour)+1) + ":00 is " 
        + this.data["averagePerHourPerWeekday"][wday][chosenHour].toFixed(3)  + ".";
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