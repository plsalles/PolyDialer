process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const axios = require('axios');

class Call {
    constructor(name, ip, password, dialString, callType, callRate) {
        this.dialString = dialString;
        this.callType = callType;
        this.callRate = callRate;
        this.name = name;
        this.ip = ip;
        this.password = password;
        this.session = ""
        this.sessionId = "";
        this.callState = "";
        this.connectionId = 0;
        this.error = "";
        this.report = "";
    }

    async getCallState() {

        let currentStatus = await axios.get(`https://${this.ip}/rest/conferences/active`, {
            headers: {
                Cookie: `session_id=${this.sessionId}`
            }
        })

        if (currentStatus.data.connections[0]) {
            let date = new Date(currentStatus.data.connections[0].startTime)
            let dateFormated = (date.getFullYear() + "-" + ((date.getMonth() + 1)) + "-" + (date.getDate()) + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds());
            this.report += `${this.dialString},${this.callType},${this.callRate},${currentStatus.data.connections[0].state},${dateFormated},`
        }

    }

    async getMediaStat() {

        let mediaStat = await axios.get(`https://${this.ip}/rest/conferences/0/connections/${this.connectionId}/mediastat`, {
            headers: {
                Cookie: `session_id=${this.sessionId}`
            }
        })
        this.report += `${mediaStat.data[0].packetLoss},${mediaStat.data[0].totalPackets},${mediaStat.data[1].packetLoss},${mediaStat.data[1].totalPackets},${mediaStat.data[2].packetLoss},${mediaStat.data[2].totalPackets},${mediaStat.data[3].packetLoss},${mediaStat.data[3].totalPackets},`
    }

    async getSession() {

        let res = "";
        this.report += `${this.name},${this.ip},`
        if (this.sessionId === "") {
            try {
                res = await axios.post(`https://${this.ip}/rest/session`, {
                    "action": "Login",
                    "user": "admin",
                    "password": this.password
                })
                this.session = res.data.session;
                this.sessionId = res.data.session.sessionId;

            } catch (error) {

                if (error.code) {
                    console.log("Error --> ", error.code)
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

        try {
            await axios.get(`https://${this.ip}/rest/session`, {
                headers: {
                    Cookie: `session_id=${this.sessionId}`
                }
            })
        } catch (error) {

        }
    }

    async makeCall() {

        let res = "";
        let currentStatus = await axios.get(`https://${this.ip}/rest/conferences/active`, {
            headers: {
                Cookie: `session_id=${this.sessionId}`
            }
        })

        if (currentStatus.data.connections.length === 0) {
            try {
                res = await axios.post(`https://${this.ip}/rest/conferences`, {
                    "address": `${this.dialString}`,
                    "dialType": `${this.callType}`,
                    "rate": `${this.callRate}`
                }, {
                    headers: {
                        Cookie: `session_id=${this.sessionId}`
                    }
                })
                this.connectionId = res.data[0].href.split("/")[5];

                res = await axios.get(`https://${this.ip}/rest/conferences/active`, {
                    headers: {
                        Cookie: `session_id=${this.sessionId}`
                    }
                })


            } catch (error) {
                console.log(error.data)
            }
        } else {
            return ("The system is already in a call", currentStatus.data)
        }
    }

    async terminateCall() {

        let currentStatus = await axios.get(`https://${this.ip}/rest/conferences/active`, {
            headers: {
                Cookie: `session_id=${this.sessionId}`
            }
        })

        if (currentStatus.data.connections.length != 0) {
            try {
                await axios.post(`https://${this.ip}/rest/conferences/active`, {
                    "action": "hangup"
                }, {
                    headers: {
                        Cookie: `session_id=${this.sessionId}`
                    }
                })
                currentStatus = await axios.get(`https://${this.ip}/rest/conferences/active`, {
                    headers: {
                        Cookie: `session_id=${this.sessionId}`
                    }
                })

                this.connectionId = 0
                let date = new Date()
                let dateFormated = (date.getFullYear() + "-" + ((date.getMonth() + 1)) + "-" + (date.getDate()) + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds());
                this.report += `${dateFormated}\r\n`


            } catch (error) {
                console.log(error.response.status)
                console.log(error.response.data.reason)
            }

            console.log("The current call is disconnected")
        } else {
            console.log("The system is not in a call")
        }
    }

    async terminateSession() {
        
        let res = "";

        try {
            res = await axios.delete(`https://${this.ip}/rest/sessions/self`, {
                headers: {
                    Cookie: `session_id=${this.sessionId}`
                }
            })
        } catch (error) {
            console.log(error.config)
            console.log(error.response)
        }
    }

}

module.exports = Call;