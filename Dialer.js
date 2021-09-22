const dateFormat = require('./utils/dateFormat');

async function dialer(calls, concurrentCalls) {

    let startIndex = calls.getIndex()
    let stopIndex;
    if (startIndex + concurrentCalls > calls.allCalls().length) {
        stopIndex = calls.allCalls().length
        calls.incrementIndex(calls.allCalls().length - startIndex)
    } else {
        stopIndex = startIndex + concurrentCalls
        calls.incrementIndex(concurrentCalls)
    }

    for (let i = startIndex; i < stopIndex; i++) {
        let newCall = calls.allCalls()[i];

        console.log(`${dateFormat(new Date())} - Initiating the call of Endpoint Line ${i + 1} Name ${newCall.endpointName} IP ${newCall.ipAddress}`)
        newCall.getSession().then(() => {
            if (newCall.sessionId != "") {
                newCall.makeCall().then(() => {
                    if (newCall.connectionId != 0 && newCall.inCall == false) {
                        //setTiemout to wait 10 seconds while the call connects, otherwise the call state would always be CONNECTING
                        setTimeout(() => {
                            newCall.getCallState().then(() => {
                                //setTimeout to wait 60 seconds while the endpoint is connected. The idea is to get the media statistics for a 1 minute call
                                setTimeout(() => {
                                    newCall.getMediaStat().then(() => {
                                        newCall.terminateCall().then(() => {
                                            console.log(`${dateFormat(new Date())} - The call of Endpoint Line ${i+1} Name ${newCall.endpointName} IP ${newCall.ipAddress} is disconnected`)
                                            calls.report += newCall.report;
                                            newCall.terminateSession();
                                        });
                                    });
                                }, 60000)
                            });
                        }, 10000)
                    } else {
                        console.log(`${dateFormat(new Date())} - The Endpoint ${newCall.endpointName} IP ${newCall.ipAddress} is already in a call`)
                        calls.report += newCall.report;
                    }

                })
            } else {
                newCall.report += `${newCall.dialString},${newCall.callType},${newCall.callRate},`
                switch (newCall.error) {
                    case 'ECONNREFUSED':

                        console.log(`${dateFormat(new Date())} - ERROR --> Unable to connect to the Endpoint Line ${i+1} Name ${newCall.endpointName} IP: ${newCall.ipAddress}`)
                        newCall.report += `UNREACHABLE\n`
                        break
                    case 'SessionInvalidUserNamePassword':
                        console.log(`${dateFormat(new Date())} - ERROR --> Invalid username or password for Endpoint Line ${i+1} Name ${newCall.endpointName} IP: ${newCall.ipAddress}`)
                        newCall.report += `SessionInvalidUserNamePassword\n`
                        break
                    default:
                        console.log(`${dateFormat(new Date())} - ERROR --> An unexpected error happened for Endpoint Line ${i+1} Name ${newCall.endpointName} IP: ${newCall.ipAddress}`)
                        newCall.report += `UnexpectedErrorHappened\n`
                }
                calls.report += newCall.report;
            }
        })
    }
}

module.exports = dialer;