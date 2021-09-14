const fs = require('fs');

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

  module.exports = createReport;