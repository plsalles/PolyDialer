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
        console.log(`Dialing from the Endpoint Name ${newCall.name} IP ${newCall.ip}\r\n`)
        newCall.getSession().then(() => {
            if (newCall.sessionId != "") {
                newCall.makeCall().then(() => {
                    if (newCall.connectionId != 0) {
                        setTimeout(() => {
                            newCall.getCallState().then(() => {
                                setTimeout(() => {
                                    newCall.getMediaStat().then(() => {
                                        newCall.terminateCall().then(() => {
                                            calls.report += newCall.report;
                                            newCall.terminateSession();
                                        });
                                    });
                                }, 60000)
                            });
                        }, 10000)
                    } else {
                        console.log("System already in a call")
                    }

                })
            } else {
                newCall.report += `${newCall.dialString},${newCall.callType},${newCall.callRate},`
                switch (newCall.error) {
                    case 'ECONNREFUSED':

                        console.log(`ERROR --> Unable to connect to the Endpoint ${newCall.name} IP: ${newCall.ip}, please check the IP and try again`)
                        newCall.report += `UNREACHABLE\r\n`
                        break
                    case 'SessionInvalidUserNamePassword':
                        console.log(`ERROR --> Invalid username or password for Endpoint ${newCall.name} IP: ${newCall.ip}`)
                        newCall.report += `SessionInvalidUserNamePassword\r\n`
                        break
                    default:
                        console.log(`ERROR --> An unexpected error happened for Endpoint${newCall.name} IP: ${newCall.ip}!`)
                        newCall.report += `UnexpectedErrorHappened\r\n`
                }
                calls.report += newCall.report;
            }
        })
    }
}

module.exports = dialer;