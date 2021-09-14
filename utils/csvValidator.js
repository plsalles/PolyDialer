
function csvValidator(calls) {
    let validator = true;
    let errorReturn = "";
    console.log("Line\tEndpoint Name\tIP Address\tUser\tPassword\tDial String\tCall Type\tCall Rate\n")

    Object.keys(calls[0]).forEach((element, index) => {

        switch (element) {
            case 'endpoint_name':
            case 'ip_address':
            case 'user':
            case 'password':
            case 'dialstring':
            case 'calltype':
            case 'callrate':
                break;
            default:
                errorReturn += `INVALID Attribute "${element}"\n`
                validator = false;
        }
    })

    if (validator) {
        calls.forEach((element, index) => {

            console.log(`${index + 1}\t${element.endpoint_name}\t${element.ip_address}\t${element.user}\t****\t${element.dialstring}\t${element.calltype}\t${element.callrate}`)
            if (!(/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(element.ip_address))) {
                errorReturn += `You have entered an invalid IP address on line ${index + 1}\n`
                validator = false
            }

            if (element.calltype != "SIP" && element.calltype != "H323") {
                errorReturn += `You have entered an invalid call type on line ${index + 1}\n`
                validator = false
            }

            if (element.callrate != "256" && element.callrate != "384" && element.callrate != "512" && element.callrate != "768" && element.callrate != "1024" && element.callrate != "1920" && element.callrate != "2048" && element.callrate != "3072" && element.callrate != "4096") {
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