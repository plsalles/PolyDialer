'use strict'
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

//////////////VARIABLES///////////////
let concurrentCalls = 2;
var report = "";
//////////////////////////////////////

class Calls {
  constructor() {
    this.calls = []
    this.index = 0
  }

  // create a new player and save it in the collection

  allCalls() {
    return this.calls
  }

  incrementIndex(i) {
    this.index += i
  }

  getIndex() {
    return this.index
  }

  newCall(name, ip, password) {
    let c = new Call(name, ip, password)
    this.calls.push(c)
    return c
  }
  // this could include summary stats like average score, etc. For simplicy, just the count for now
  numberOfCalls() {
    return this.calls.length
  }
}

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
    this.report = ""
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
    this.report += `${this.name},${this.ip},`
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
    let currentStatus = await axios.get(`https://${this.ip}/rest/conferences/active`, {
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

        console.log(new Date())
        res = await axios.get(`https://${this.ip}/rest/conferences/active`, {
          headers: {
            Cookie: `session_id=${this.sessionId}`
          }
        })

        setTimeout(() => {
          console.log(new Date())
        }, 5000)
        res = await axios.get(`https://${this.ip}/rest/conferences/active`, {
          headers: {
            Cookie: `session_id=${this.sessionId}`
          }
        })

        setTimeout(() => {
          console.log(new Date())
          console.log(res.data)
          this.report += `${res.data.connections[0].address},${res.data.connections[0].state},${res.data.connections[0].callType},${res.data.connections[0].startTime},`
        }, 5000)

      } catch (error) {
      console.log(error.data)
      console.log("Catch Line 149")

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

  console.log("terminating the call ", currentStatus.data)
  if (currentStatus.data.connections.length != 0) {
    try {
      res = await axios.post(`https://${this.ip}/rest/conferences/active`, {
        "action": "hangup"
      }, {
        headers: {
          Cookie: `session_id=${this.sessionId}`
        }
      })
      currentStatus = await axios.get('https://192.168.1.133/rest/conferences/active', {
        headers: {
          Cookie: `session_id=${this.sessionId}`
        }
      })
      console.log(currentStatus.data)
      console.log(this.report)
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
//////////////////////////////////////////////////////////////////////////////////////////////////////////////

console.log("GSDialer initialized");

console.log("Reading CSV file")
const { promises: { readFile } } = require("fs");
const { clear } = require('console');

readFile("/mnt/d/Repo/PolyDialer/GroupSeriesList.txt").then(fileBuffer => {
  let input = fileBuffer.toString().split('\r\n')
  console.log(input)
  input = input.forEach((element) => {
    let output = element.split(',')
    console.log(output)
  })

  /////////Converting the CSV input to a Object////////////
  const [headerLine, ...lines] = fileBuffer.toString().split('\r\n');
  const valueSeparator = ',';
  const headers = headerLine.split(valueSeparator);
  const objects = lines
    .map((line, index) =>
      line.split(valueSeparator).reduce(
        (object, value, index) => ({
          ...object,
          [headers[index]]: value,
        }),
        {}
      )
    );
  ///////////////////////////////////////////////////////

  let calls = new Calls();

  objects.forEach((element) => {
    calls.newCall(element.endpoint_name, element.ip_address, element.password)
  })
  let interval;

  let dialerInterval = setInterval(async function () {
    if (calls.allCalls().length <= calls.getIndex()) {
      clearInterval(dialerInterval)
    } else {
      dialer(calls, concurrentCalls);
    }
  }, 15000);
})



// Support Functions

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

    newCall.getSession().then(() => {
      if (newCall.sessionId != "") {
        newCall.makeCall().then(() => {
          if (newCall.connectionId != 0) {
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
  }
}
