async function dialer(calls, concurrentCalls) {

    let start = calls.getIndex()
    let stop;
    if (start + concurrentCalls > calls.allCalls().length) {
        stop = calls.allCalls().length
        calls.incrementIndex(calls.allCalls().length - start)
    } else {
        stop = start + concurrentCalls
        calls.incrementIndex(concurrentCalls)
    }

    for (let i = start; i < stop; i++) {
        let newCall = calls.allCalls()[i];
        console.log(`Initiating the call of Endpoint Line ${i + 1} Name ${newCall.name} IP ${newCall.ip} - ${new Date()}`)
        newCall.getSession().then(() => {
            if (newCall.sessionId != "") {
                newCall.makeCall().then(() => {
                    if (newCall.connectionId != 0 && newCall.inCall == false) {
                        setTimeout(() => {
                            newCall.getCallState().then(() => {
                                setTimeout(() => {
                                    newCall.getMediaStat().then(() => {
                                        newCall.terminateCall().then(() => {
                                            console.log(`The call of Endpoint Line ${i+1} Name ${newCall.name} IP ${newCall.ip} is disconnected - ${new Date()}`)
                                            calls.report += newCall.report;
                                            newCall.terminateSession();
                                        });
                                    });
                                }, 60000)
                            });
                        }, 10000)
                    } else {
                        console.log(`The Endpoint ${newCall.name} IP ${newCall.ip} is already in a call - ${new Date()}`)
                        calls.report += newCall.report;
                    }

                })
            } else {
                newCall.report += `${newCall.dialString},${newCall.callType},${newCall.callRate},`
                switch (newCall.error) {
                    case 'ECONNREFUSED':

                        console.log(`ERROR --> Unable to connect to the Endpoint Line ${i+1} Name ${newCall.name} IP: ${newCall.ip} - ${new Date()}`)
                        newCall.report += `UNREACHABLE\n`
                        break
                    case 'SessionInvalidUserNamePassword':
                        console.log(`ERROR --> Invalid username or password for Endpoint Line ${i+1} Name ${newCall.name} IP: ${newCall.ip} - ${new Date()}`)
                        newCall.report += `SessionInvalidUserNamePassword\n`
                        break
                    default:
                        console.log(`ERROR --> An unexpected error happened for Endpoint Line ${i+1} Name ${newCall.name} IP: ${newCall.ip} - ${new Date()}`)
                        newCall.report += `UnexpectedErrorHappened\n`
                }
                calls.report += newCall.report;
            }
        })
    }
}

module.exports = dialer;