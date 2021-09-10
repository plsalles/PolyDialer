'use strict'
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

//////////////VARIABLES///////////////
let concurrentCalls = 2;
const fs = require('fs');
//////////////////////////////////////

class Calls {
  constructor() {
    this.calls = []
    this.index = 0
    this.report = "Endpoint Name,Endpoint IP,Dial String,Call Type,Start Time, Call State, Audio TX Packet Loss, Audio TX Total Packets,Audio RX Packet Loss, Audio RX Total Packets,Video TX Packet Loss, Video TX Total Packets,Video RX Packet Loss, Video RX Total Packets,End Time\r\n"
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
    this.callState = "";
    this.connectionId = 0;
    this.error = "";
    this.report = ""
  }

  async getCallState() {
    const axios = require('axios');
    let res = "";
    let currentStatus = await axios.get(`https://${this.ip}/rest/conferences/active`, {
      headers: {
        Cookie: `session_id=${this.sessionId}`
      }
    })

    if (currentStatus.data.connections[0]) {
      let date = new Date(currentStatus.data.connections[0].startTime)
      let dateFormated = (date.getFullYear() + "-" + ((date.getMonth() + 1)) + "-" + (date.getDate()) + " " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds());
      this.report += `${currentStatus.data.connections[0].address},${currentStatus.data.connections[0].callType},${dateFormated},${currentStatus.data.connections[0].state},`
      //console.log(this.report)
    }

  }

  async getMediaStat() {
    const axios = require('axios');
    let mediaStat = await axios.get(`https://${this.ip}/rest/conferences/0/connections/${this.connectionId}/mediastat`, {
      headers: {
        Cookie: `session_id=${this.sessionId}`
      }
    })
    this.report += `${mediaStat.data[0].packetLoss},${mediaStat.data[0].totalPackets},${mediaStat.data[1].packetLoss},${mediaStat.data[1].totalPackets},${mediaStat.data[2].packetLoss},${mediaStat.data[2].totalPackets},${mediaStat.data[3].packetLoss},${mediaStat.data[3].totalPackets},`
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
      res = await axios.get(`https://${this.ip}/rest/session`, {
        headers: {
          Cookie: `session_id=${this.sessionId}`
        }
      })
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
    //console.log(currentStatus.data.connections)

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
        //console.log("ConnectionID --> ", res.data[0].href.split("/")[5])

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
    const axios = require('axios');

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
        console.log(dateFormated)
        this.report += `${dateFormated}\r\n`
        //console.log(this.report)

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
    const axios = require('axios');
    let res = "";

    try {
      //console.log("this.sessionId = ", this.sessionId)
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
    //console.log(output)
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
  let response;

  let dialerInterval = setInterval(async function () {
    if (calls.allCalls().length <= calls.getIndex()) {
      clearInterval(dialerInterval)
    } else {
      response = await dialer(calls, concurrentCalls)

    }
  }, 10000);
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
              newCall.getCallState().then(() => {
                setTimeout(() => {
                  //console.log("entrando no media stat")
                  newCall.getMediaStat().then(() => {
                    //console.log("entrando no media stat")
                    newCall.terminateCall().then(() => {
                      newCall.terminateSession();
                      calls.report += newCall.report;
                      if (i + 1 === stop) {
                        generateReport(calls.report);
                      }
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
        if (i + 1 === stop) {
          generateReport(calls.report);
        }
      }
    })
  }
}

async function generateReport(report) {

  let date = new Date()
  let dataFormated = (date.getFullYear() + "0" + ((date.getMonth() + 1)) + "0" + (date.getDate()) + date.getHours() + date.getMinutes());
  fs.writeFile(`/mnt/d/Repo/PolyDialer/PolyDialerReport-${dataFormated}.csv`, report, function (err) {
    if (err) {
      return console.log(err);
    }
    console.log("Poly dialer has finished, please check the reports");
  });


}