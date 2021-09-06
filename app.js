'use strict'

//////////Importing libraries/////////
const fs = require('fs');
var report = "";
/////////////////////////////////////

//////////////VARIABLES///////////////
let concurrentCalls = 2;
//////////////////////////////////////

/////////////////////////////////Call Controller/////////////////////////////////////////////////////////
const Telnet = require('telnet-client')

let regexInCall = /inacall online/;

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
    this.state = "disconnected";
  }
  async call() {
    console.log(`Calling Endpoint ${this.name} - IP: ${this.ip}`)
    let connection = new Telnet()

    //Telnet parameters
    let params = {
      failedLoginMatch: '-- password failed, retry --',
      host: this.ip,
      port: 24,
      password: `${this.password}\r\n`,
      passwordPrompt: 'Password: ',
      shellPrompt: '-> ',
      timeout: 8000
    }

    try {
      await connection.connect(params)
      console.log(`Connected to the GS Endpoint IP: ${this.ip} Name: ${this.name}`)
    } catch (error) {
      console.log(`Failed to connect to the GS Endpoint IP: ${this.ip} Name: ${this.name}`)
      console.log(error)
      return error
    }


    report += `\t${this.name}\t${this.ip}`;
    let res = '';
    let i = 0;
    let regexInCall = /inacall online/;

    res = await connection.send('dial manual 1024 888888.1120324757@t.plcm.vc h323');
    report += `\t${res.replace(/\r?\n|\r/g, "")}`;

    setTimeout(async function () {
      let res = await connection.send('status');

      if (regexInCall.test(res)) {
        report += `\tinacall online`;
        this.state = "connected";
        await connection.end();
        return `GS Endpoint IP: ${this.ip} Name: ${this.name} is connected`
        await connection.end();
      } else {
        report += `\tinacall offline\n`;
        await connection.end();
        return `GS Endpoint IP: ${this.ip} Name: ${this.name} did not connect, please check the logs`
      }

    }, 8000);
  }
  
  async disconnect() {
    let connection = new Telnet()


    let params = {
      host: this.ip,
      port: 24,
      password: `${this.password}\r\n`,
      passwordPrompt: 'Password: ',
      shellPrompt: '-> ',
      timeout: 8000
    }
    try {
      await connection.connect(params)
    } catch (error) {
      return error;
    }
    if (this.state = "connected") this.state = "disconnected"
    let res = await connection.send('hangup all');
    console.log(`Connected to the GS Endpoint IP: ${this.ip} Name: ${this.name} - Call is disconnected`)
    await connection.end();
    return res;

  }
}

//////////////////////////////////////////////////////////////////////////////////////////////////////////////

console.log("GSDialer initialized");

console.log("Reading CSV file")
const { promises: { readFile } } = require("fs");
const { clear } = require('console');

// Promise.all([promise1, promise2, promise3]).then((values) => {
//   console.log(values);
// });
readFile("/mnt/d/Repo/GS-ReportStatus-Telnet/GroupSeriesList.txt").then(fileBuffer => {
  let input = fileBuffer.toString().split('\r\n')
  console.log(input)
  input = input.forEach((element)=> {
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

  let dialerInterval = setInterval(async function () {
    if (calls.allCalls().length <= calls.getIndex()) {
      clearInterval(dialerInterval)
      setTimeout(() => { console.log("GS Dialer has finished all calls, please check the report") }, 5000)
    } else {
      dialer(calls, concurrentCalls);
    }
  }, 15000);
}).catch(error => {
  console.log("entrou aqui")
  console.error(error.message);
  process.exit(1);
})



// Support Functions

function dialer(calls, concurrentCalls) {

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
    let resCall = newCall.call()

    if (resCall.toString().indexOf('Error:') === -1) {
      setTimeout(async function () {
        let resDisconnect = newCall.disconnect();
      }, 20000);
    }
  }
}