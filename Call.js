process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const axios = require('axios');
const dateFormat = require('./utils/dateFormat');

class Call {
    constructor(endpointName, endpointType, ipAddress, password, dialString, callType, callRate) {
        this.dialString = dialString;
        this.callType = callType;
        this.callRate = callRate;
        this.endpointType = endpointType;
        this.endpointName = endpointName;
        this.ipAddress = ipAddress;
        this.password = password;
        this.sessionId = "";
        this.inCall = false;
        this.connectionId = 0;
        this.error = "";
        this.report = "";
    }

    async getCallState() {

        let res = await axios.get(`https://${this.ipAddress}/rest/conferences/active`, {
            headers: {
                Cookie: `session_id=${this.sessionId}`
            }
        })

        if (res.data.connections[0]) {
            this.report += `${this.dialString},${this.callType},${this.callRate},${res.data.connections[0].state},${dateFormat(res.data.connections[0].startTime)},`
        }
        return res.data;

    }

    async getMediaStat() {
        
        let res = await axios.get(`https://${this.ipAddress}/rest/conferences/0/connections/${this.connectionId}/mediastat`, {
            headers: {
                Cookie: `session_id=${this.sessionId}`
            }
        })
        this.report += `${res.data[0].packetLoss},${res.data[0].totalPackets},${res.data[1].packetLoss},${res.data[1].totalPackets},${res.data[2].packetLoss},${res.data[2].totalPackets},${res.data[3].packetLoss},${res.data[3].totalPackets},`
        return res.data;
    }

    async getSession() {

        let res = "";
        this.report += `${this.endpointName},${this.ipAddress},${this.endpointType},`
        if (this.sessionId === "") {
            try {
                res = await axios.post(`https://${this.ipAddress}/rest/session`, {
                    "action": "Login",
                    "user": "admin",
                    "password": this.password
                })
                //this.session = res.data.session;
                this.sessionId = res.data.session.sessionId;

            } catch (error) {

                if (error.code) {
                    this.error = error.code
                    return
                }

                if (error.response.status) {
                    console.log("Error --> ", error.response.status)
                    console.log("Reason --> ", error.response.data.reason)
                    this.error = error.response.data.reason;
                    return
                }

                console.log(error)
                return
            }
        }
    }

    async makeCall() {

        let res = await axios.get(`https://${this.ipAddress}/rest/conferences/active`, {
            headers: {
                Cookie: `session_id=${this.sessionId}`
            }
        })

        if (res.data.connections.length === 0) {
            try {
                res = await axios.post(`https://${this.ipAddress}/rest/conferences`, {
                    "address": `${this.dialString}`,
                    "dialType": `${this.callType}`,
                    "rate": `${this.callRate}`
                }, {
                    headers: {
                        Cookie: `session_id=${this.sessionId}`
                    }
                })
                this.connectionId = res.data[0].href.split("/")[5];

                res = await axios.get(`https://${this.ipAddress}/rest/conferences/active`, {
                    headers: {
                        Cookie: `session_id=${this.sessionId}`
                    }
                })
            } catch (error) {
                console.log(error.data)
            }
        } else {
            this.inCall = true;
            this.report += `${this.dialString},${this.callType},${this.callRate},AlreadyInCall,${dateFormat(res.data.connections[0].startTime)}\r\n`
        }
    }

    async terminateCall() {

        let res = await axios.get(`https://${this.ipAddress}/rest/conferences/active`, {
            headers: {
                Cookie: `session_id=${this.sessionId}`
            }
        })

        if (res.data.connections.length != 0 && this.inCall == false) {
            try {
                await axios.post(`https://${this.ipAddress}/rest/conferences/active`, {
                    "action": "hangup"
                }, {
                    headers: {
                        Cookie: `session_id=${this.sessionId}`
                    }
                })

                res = await axios.get(`https://${this.ipAddress}/rest/conferences/active`, {
                    headers: {
                        Cookie: `session_id=${this.sessionId}`
                    }
                })

                this.connectionId = 0
                this.report += `${dateFormat()}\r\n`

            } catch (error) {
                console.log(error)
                console.log(error.response.status)
                console.log(error.response.data.reason)
            }

        } else {
            console.log("The system is not in a call or the current call was not initiated by PolyDialer")
        }
        return res.data
    }


    async terminateSession() {

        let res = "";
        switch (this.endpointType) {
            case 'group':
                try {
                    res = await axios.delete(`https://${this.ipAddress}/rest/sessions/self`, {
                        headers: {
                            Cookie: `session_id=${this.sessionId}`
                        }
                    })
                    console.log(res.data)
                } catch (error) {
                    console.log(error.config)
                    console.log(error.response)
                }
                return res;
            case 'nextGen':
                try {
                    res = await axios.delete(`https://${this.ipAddress}/rest/session`, {
                        headers: {
                            Cookie: `session_id=${this.sessionId}`
                        }
                    })
                    console.log(res.data)
                } catch (error) {
                    console.log(error.config)
                    console.log(error.response)
                }
                return res;
        }
    }
}

module.exports = Call;