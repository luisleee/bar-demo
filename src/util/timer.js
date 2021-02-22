function timer() {
    let now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth() + 1;
    let date = now.getDate();
    let hour = now.getHours();
    let minute = now.getMinutes() + 1;
    let second = now.getSeconds() + 1;

    let dateString = [year, month, date].join("-");
    let timeString = [hour, minute, second].join(":");
    return dateString + " " + timeString;
}

module.exports = timer;
