const dateFormat = require('./utils/dateFormat');

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
        console.log(`${dateFormat(new Date())} - Initiating the call of Endpoint Line ${i + 1} Name ${newCall.name} IP ${newCall.ip}`)
        newCall.getSession().then(() => {
            if (newCall.sessionId != "") {
                newCall.makeCall().then(() => {
                    if (newCall.connectionId != 0 && newCall.inCall == false) {
                        setTimeout(() => {
                            newCall.getCallState().then(() => {
                                setTimeout(() => {
                                    newCall.getMediaStat().then(() => {
                                        newCall.terminateCall().then(() => {
                                            console.log(`${dateFormat(new Date())} - The call of Endpoint Line ${i+1} Name ${newCall.name} IP ${newCall.ip} is disconnected`)
                                            calls.report += newCall.report;
                                            newCall.terminateSession();
                                        });
                                    });
                                }, 60000)
                            });
                        }, 10000)
                    } else {
                        console.log(`${dateFormat(new Date())} - The Endpoint ${newCall.name} IP ${newCall.ip} is already in a call`)
                        calls.report += newCall.report;
                    }

                })
            } else {
                newCall.report += `${newCall.dialString},${newCall.callType},${newCall.callRate},`
                switch (newCall.error) {
                    case 'ECONNREFUSED':

                        console.log(`${dateFormat(new Date())} - ERROR --> Unable to connect to the Endpoint Line ${i+1} Name ${newCall.name} IP: ${newCall.ip}`)
                        newCall.report += `UNREACHABLE\n`
                        break
                    case 'SessionInvalidUserNamePassword':
                        console.log(`${dateFormat(new Date())} - ERROR --> Invalid username or password for Endpoint Line ${i+1} Name ${newCall.name} IP: ${newCall.ip}`)
                        newCall.report += `SessionInvalidUserNamePassword\n`
                        break
                    default:
                        console.log(`${dateFormat(new Date())} - ERROR --> An unexpected error happened for Endpoint Line ${i+1} Name ${newCall.name} IP: ${newCall.ip}`)
                        newCall.report += `UnexpectedErrorHappened\n`
                }
                calls.report += newCall.report;
            }
        })
    }
}

module.exports = dialer;