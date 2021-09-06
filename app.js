'use strict'

//////////Importing libraries/////////

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
/////////////////////////////////////


class Call {
    constructor(name, ip, password) {
        this.name = name;
        this.ip = ip;
        this.password = password;
        this.session = ""
        this.sessionId = "";
        this.state = "";
        this.connectionId = 0;
        this.error = "";
    }

    async getMediaStat() {
        const axios = require('axios');
        let res = "";
        let mediaStat = await axios.get(`https://192.168.1.133/rest/conferences/0/connections/${this.connectionId}/mediastat`, {
            headers: {
                Cookie: `session_id=${this.sessionId}`
            }
        })
        console.log(mediaStat.data)
    }

    async getSession() {
        const axios = require('axios');
        let res = "";

        if (this.sessionId === "") {
            try {
                res = await axios.post(`https://${this.ip}/rest/session`, {
                    "action": "Login",
                    "user": "admin",
                    "password": this.password
                })
                console.log("GetSession Line 42")
                console.log("POST --> ", res.data.session)
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
            res = await axios.get('https://192.168.1.133/rest/session', {
                headers: {
                    Cookie: `session_id=${this.sessionId}`
                }
            })
            console.log("GET --> ", res.data)
        } catch (error) {
            console.log(error.config)
            console.log(error.response)
        }
    }

    async makeCall() {
        const axios = require('axios');
        let res = "";
        let currentStatus = await axios.get('https://192.168.1.133/rest/conferences/active', {
            headers: {
                Cookie: `session_id=${this.sessionId}`
            }
        })
        console.log(currentStatus.data.connections)

        if (currentStatus.data.connections.length === 0) {
            try {
                res = await axios.post(`https://${this.ip}/rest/conferences`, {
                    "address": "888888.1120324757@t.plcm.vc",
                    "dialType": "H323",
                    "rate": "1024"
                }, {
                    headers: {
                        Cookie: `session_id=${this.sessionId}`
                    }
                })
                this.connectionId = res.data[0].href.split("/")[5];
                console.log("ConnectionID --> ", res.data[0].href.split("/")[5])
                currentStatus = await axios.get('https://192.168.1.133/rest/conferences/active', {
                    headers: {
                        Cookie: `session_id=${this.sessionId}`
                    }
                }).then("System in call", console.log(currentStatus.data.connections))


            } catch (error) {
                console.log(error.response.status)
                console.log(error.response.data.reason)
            }
        } else {
            return ("The system is already in a call", currentStatus.data)
        }
    }

    async terminateCall() {
        const axios = require('axios');
        let res = "";
        let currentStatus = await axios.get('https://192.168.1.133/rest/conferences/active', {
            headers: {
                Cookie: `session_id=${this.sessionId}`
            }
        })
        console.log(this.session)
        console.log(currentStatus.data)

        if (currentStatus.data.connections.length != 0) {
            try {
                res = await axios.post(`https://${this.ip}/rest/conferences/active`, {
                    "action": "hangup"
                }, {
                    headers: {
                        Cookie: `session_id=${this.sessionId}`
                    }
                })
                this.connectionId = 0



            } catch (error) {
                console.log(error.response.status)
                console.log(error.response.data.reason)
            }

            console.log("The current call is disconnected", currentStatus.data.connections)
        } else {
            console.log("The system is not in a call", currentStatus.data)
        }



    }




    async terminateSession() {
        const axios = require('axios');
        let res = "";

        try {
            console.log("this.sessionId = ", this.sessionId)
            res = await axios.delete('https://192.168.1.133/rest/sessions/self', {
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

let newCall = new Call("GS1", "192.168.1.133", "5712");

newCall.getSession().then(() => {
    if (newCall.sessionId != "") {
        newCall.makeCall().then(() => {
            if(newCall.connectionId != 0){
                setTimeout(() => {
                    newCall.getMediaStat().then(() => {
                        newCall.terminateCall().then(() => {
                            newCall.terminateSession();
                        });
                    });
                }, 65000)
            } else {
                console.log("System already in a call")
            }
        })
    } else {
        switch (newCall.error) {
            case 'ECONNREFUSED':
                console.log("ERROR --> Unable to connect to the endpoint, please check the IP and try again")
                break
            case 'SessionInvalidUserNamePassword':
                console.log("ERROR --> Invalid username or password")
                break    
            default:
                console.log("ERROR --> An unexpected error happened!")
        }
    }
})

