'use strict'

const fs = require('fs');
const { promises: { readFile } } = require("fs");
const { clear, Console } = require('console');

const Calls = require('./Calls')
const dialer = require('./Dialer')



let concurrentCalls = 2;
// let dialString = '888888.1120324757@t.plcm.vc';
// let callType = "SIP"; // "H323 or SIP"
// let callRate = 1024;

console.log("GSDialer initialized");

readFile("/mnt/d/Repo/PolyDialer/GroupSeriesList.txt").then(fileBuffer => {
  console.log("Reading CSV file")
  console.log(fileBuffer.toString())
  let input = fileBuffer.toString().split('\r\n')
  console.log(input)
  input = input.forEach((element) => {
    let output = element.split(',')
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
          [headers[index].toLowerCase()]: value,
        }),
        {}
      )
    );
  ///////////////////////////////////////////////////////

  let calls = new Calls();
  console.log(objects)

  objects.forEach((element) => {
    calls.newCall(element.endpoint_name, element.ip_address, element.password, element.dialstring, element.calltype.toUpperCase(), element.callrate)
  })
  let response;

  let dialerInterval = setInterval(async function () {
    if (calls.allCalls().length <= calls.getIndex()) {
      clearInterval(dialerInterval)
      setTimeout(() => {
        console.log("Creating the CSV Report, please wait")
        createReport(calls.report);
      },120000)
    } else {
      response = await dialer(calls, concurrentCalls)
    }
  }, 10000);
})

async function createReport(report) {

  let date = new Date()
  let dataFormated = (date.getFullYear() + "0" + ((date.getMonth() + 1)) + "0" + (date.getDate()) + date.getHours() + date.getMinutes());
  fs.writeFile(`/mnt/d/Repo/PolyDialer/PolyDialerReport-${dataFormated}.csv`, report, function (err) {
      if (err) {
          return console.log(err);
      }
      console.log("Poly dialer has finished, please check the reports");
  });


}