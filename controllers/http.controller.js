process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const axios = require('axios');



class HTTPController {
    constructor() {
        this.dialString = dialString;
    }

    async getCallState(endpointType, ip, sessionId) {
        switch (endpointType) {
            case 'group':
                return await axios.get(`https://${ip}/rest/conferences/active`, {
                    headers: {
                        Cookie: `session_id=${sessionId}`
                    }
                })
            case 'nextGen':
                return await axios.get(`https://${ip}/rest/conferences/active`, {
                    headers: {
                        Cookie: `session_id=${sessionId}`
                    }
                })
        }
    }

    async getMediaStat(endpointType, ip, sessionId, connectionId) {
        switch (endpointType) {
            case 'group':
                return await axios.get(`https://${ip}/rest/conferences/0/connections/${connectionId}/mediastat`, {
                    headers: {
                        Cookie: `session_id=${sessionId}`
                    }
                })
            case 'nextGen':
        }
    }

    async getSession(endpointType, ip, sessionId) {
        let res = "";
        switch (endpointType) {
            case 'group':
                if (sessionId === "") {
                    res = await axios.post(`https://${ip}/rest/session`, {
                        "action": "Login",
                        "user": "admin",
                        "password": password
                    })
                } else {
                    res = await axios.get(`https://${ip}/rest/session`, {
                        headers: {
                            Cookie: `session_id=${sessionId}`
                        }
                    })
                }
            case 'nextGen':
                break;
        }
        return res;
    }

    async makeCall(endpointType, ip, sessionId, dialString, callType, callRate) {

        let res = "";

        switch (endpointType) {
            case 'group':
                res = await axios.get(`https://${ip}/rest/conferences/active`, {
                    headers: {
                        Cookie: `session_id=${sessionId}`
                    }
                })

                if (res.data.connections.length === 0) {

                    res = await axios.post(`https://${ip}/rest/conferences`, {
                        "address": `${dialString}`,
                        "dialType": `${callType}`,
                        "rate": `${callRate}`
                    }, {
                        headers: {
                            Cookie: `session_id=${sessionId}`
                        }
                    })
                    this.connectionId = res.data[0].href.split("/")[5];

                    res = await axios.get(`https://${ip}/rest/conferences/active`, {
                        headers: {
                            Cookie: `session_id=${sessionId}`
                        }
                    })

                    return res.data
                } else {
                    return ("The system is already in a call", res.data)
                }
            case 'nextGen':

        }


    }

    async terminateCall(endpointType, ip, sessionId) {
        let res = "";

        switch (endpointType) {
            case 'group':
                res = await axios.get(`https://${ip}/rest/conferences/active`, {
                    headers: {
                        Cookie: `session_id=${sessionId}`
                    }
                })

                if (res.data.connections.length != 0) {

                    await axios.post(`https://${ip}/rest/conferences/active`, {
                        "action": "hangup"
                    }, {
                        headers: {
                            Cookie: `session_id=${sessionId}`
                        }
                    })
                    res = await axios.get(`https://${ip}/rest/conferences/active`, {
                        headers: {
                            Cookie: `session_id=${sessionId}`
                        }
                    })
                    console.log("The current call is disconnected")
                    return res.data

                } else {
                    console.log("The system is not in a call")
                    return res.data;
                }
            case 'nextGen':

        }

    }

    async terminateSession(endpointType, ip, sessionId) {

        try {
            let res = await axios.delete(`https://${ip}/rest/sessions/self`, {
                headers: {
                    Cookie: `session_id=${sessionId}`
                }
            })
        } catch (error) {
            console.log(error.config)
            console.log(error.response)
        }

        return res.data;
    }

}

module.exports = new HTTPController();