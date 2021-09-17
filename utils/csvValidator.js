
function csvValidator(calls) {
    let validator = true;
    let errorReturn = "";
    console.log("Line\tEndpoint Name\tEndpoint Type\tIP Address\tUser\tPassword\tDial String\tCall Type\tCall Rate\n")

    Object.keys(calls[0]).forEach((element) => {
        switch (element) {
            case 'endpointName':
            case 'endpointType':
            case 'ipAddress':
            case 'user':
            case 'password':
            case 'dialString':
            case 'callType':
            case 'callRate':
                break;
            default:
                errorReturn += `INVALID Attribute "${element}"\n`
                validator = false;
        }
    })

    if (validator) {
        calls.forEach((element, index) => {

            console.log(`${index + 1}\t${element.endpointName}\t${element.endpointType}\t${element.ipAddress}\t${element.user}\t****\t${element.dialString}\t${element.callType}\t${element.callRate}`)
            if (!(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(element.ipAddress))) {
                errorReturn += `You have entered an invalid IP address on line ${index + 1}\n`
                validator = false
            }

            if (element.endpointType.toLowerCase() != "group" && element.endpointType.toLowerCase() != "nextgen") {
                errorReturn += `You have entered an invalid endpoint type on line ${index + 1}\n`
                validator = false
            }

            if (element.callType != "SIP" && element.callType != "H323") {
                errorReturn += `You have entered an invalid call type on line ${index + 1}\n`
                validator = false
            }

            if (element.callRate != "256" && element.callRate != "384" && element.callRate != "512" && element.callRate != "768" && element.callRate != "1024" && element.callRate != "1920" && element.callRate != "2048" && element.callRate != "3072" && element.callRate != "4096") {
                errorReturn += `You have entered an invalid call rate on line ${index + 1}\n`
                validator = false
            }
        });
    }

    if (errorReturn === "") {
        console.log("\n ------ ERRORS ------")
        console.log("No Errors found in the csv file\n")
    } else {
        console.log("\n ------ ERRORS ------")
        console.log(`${errorReturn}\n`)
    }


    return validator;

}

module.exports = csvValidator;