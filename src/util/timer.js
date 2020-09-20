function timer() {
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    var date = now.getDate();
    var hour = now.getHours();
    var minute = now.getMinutes() + 1;
    var second = now.getSeconds() + 1;

    var dateString = [year, month, date].join("-");
    var timeString = [hour, minute, second].join(":");
    return dateString + " " + timeString;
}

module.exports = timer;
