
function dateFormat (date) {
    let returnDate = "";
    if(date){
        returnDate = new Date(date);
        return (returnDate.getFullYear() + "-" + ((returnDate.getMonth() + 1)) + "-" + (returnDate.getDate()) + " " + returnDate.getHours() + ":" + returnDate.getMinutes() + ":" + returnDate.getSeconds());
    } else {
        let newDate = new Date()
        return (newDate.getFullYear() + "-" + ((newDate.getMonth() + 1)) + "-" + (newDate.getDate()) + " " + newDate.getHours() + ":" + newDate.getMinutes() + ":" + newDate.getSeconds());
    }
    
}


module.exports = dateFormat;