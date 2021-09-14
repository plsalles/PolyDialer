'use strict'

const fs = require('fs');
const { promises: { readFile } } = require("fs");
const { clear, Console } = require('console');

const Calls = require('./Calls');
const Dialer = require('./Dialer');
const convertToObj = require('./utils/convertToObj');
const createReport = require('./utils/createReport');
const csvValidator = require('./utils/csvValidator');

let concurrentCalls = 2;

console.log("GSDialer initialized");

readFile("/mnt/d/Repo/PolyDialer/GroupSeriesList.txt").then(fileBuffer => {
  console.log("Reading CSV file")

  let calls = new Calls();
  let objects = convertToObj(fileBuffer.toString().split('\r\n'));
  if (csvValidator(objects)) {
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
        }, 120000)
      } else {
        response = await Dialer(calls, concurrentCalls)
      }
    }, 10000);
  }
})

