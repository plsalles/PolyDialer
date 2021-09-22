'use strict'

const { promises: { readFile } } = require("fs");
const Calls = require('./Calls');
const Dialer = require('./Dialer');
const dateFormat = require('./utils/dateFormat');
const convertToObj = require('./utils/convertToObj');
const createReport = require('./utils/createReport');
const csvValidator = require('./utils/csvValidator');

//Number of concurrent calls the dialer will make per interval
let concurrentCalls = 2;
//Dialer interval between concurrent calls in seconds
let dialerTimer = 80;

console.log("PolyDialer has started");

readFile("/mnt/d/Repo/PolyDialer/GroupSeriesList.txt").then(fileBuffer => {
  console.log("Reading CSV file")

  let calls = new Calls();
  let objects = convertToObj(fileBuffer.toString().split('\r\n'));

  if (csvValidator(objects)) {
    objects.forEach((element) => {
      calls.newCall(element.endpointName, element.endpointType.toLowerCase(), element.ipAddress, element.password, element.dialString, element.callType.toUpperCase(), element.callRate)
    })

    console.log(dateFormat(new Date()),"- Poly Dialer is starting to make calls!")
    let dialerInterval = setInterval(async function () {
      
      if (calls.allCalls().length <= calls.getIndex()) {
        clearInterval(dialerInterval)
        console.log(dateFormat(new Date())," - Creating the CSV Report, please wait" )
        setTimeout(() => {
          createReport(calls.report);
        }, 120000)
      } else {
        await Dialer(calls, concurrentCalls)
      }
    }, dialerTimer*1000);
  }
})

