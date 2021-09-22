
function dateFormat (date) {
    let returnDate = "";
    let month = "";
    let day = "";
    let hours = "";
    let minutes = "";
    let seconds = "";

    if(date){
        returnDate = new Date(date);
        month = returnDate.getMonth() + 1
        day = returnDate.getDate()
        hours = returnDate.getHours()
        minutes = returnDate.getMinutes()
        seconds = returnDate.getSeconds()
        if (month < 10){
            month = "0" + month;
        }

        if (day < 10){
            day = "0" + day;
        }

        if (hours < 10){
            hours = "0" + hours;
        }

        if (minutes < 10){
            minutes = "0" + minutes;
        }

        if (seconds < 10){
            seconds = "0" + seconds;
        }
        return (returnDate.getFullYear() + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds);
    } else {

        let newDate = new Date()
        //return (newDate.getFullYear() + "-" + ((newDate.getMonth() + 1)) + "-" + (newDate.getDate()) + " " + newDate.getHours() + ":" + newDate.getMinutes() + ":" + newDate.getSeconds());

        month = newDate.getMonth() + 1
        day = newDate.getDate()
        hours = newDate.getHours()
        minutes = newDate.getMinutes()
        seconds = newDate.getSeconds()

        if (month < 10){
            month = "0" + month;
        }

        if (day < 10){
            day = "0" + day;
        }

        if (hours < 10){
            hours = "0" + hours;
        }

        if (minutes < 10){
            minutes = "0" + minutes;
        }

        if (seconds < 10){
            seconds = "0" + seconds;
        }
        return (newDate.getFullYear() + "-" + month + "-" + day + " " + hours + ":" + minutes + ":" + seconds);
    }
    
}


module.exports = dateFormat;