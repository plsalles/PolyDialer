const Call = require('./Call')

class Calls {
    constructor() {
      this.calls = []
      this.startIndex = 0
      this.report = "Endpoint Name, Endpoint IP, Endpoint Type, Dial String,Call Type, Call Rate, Call/Endpoint State, Start Time, Audio TX Packet Loss, Audio TX Total Packets,Audio RX Packet Loss, Audio RX Total Packets,Video TX Packet Loss, Video TX Total Packets,Video RX Packet Loss, Video RX Total Packets,End Time\r\n"
    }
  
    allCalls() {
      return this.calls
    }
  
    incrementIndex(i) {
      this.startIndex += i
    }
  
    getIndex() {
      return this.startIndex
    }
  
    newCall(endpointName, endpointType, ip, password, dialString, callType, callRate) {
      let c = new Call(endpointName, endpointType, ip, password, dialString, callType, callRate)
      this.calls.push(c)
      return c
    }

    numberOfCalls() {
      return this.calls.length
    }
  }

  module.exports = Calls;

