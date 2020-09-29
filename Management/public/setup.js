/* chart.js chart examples */
userChartData = JSON.parse(userChartData)

// chart colors
var colors = ['#c6c6c6','#7258b0','#333333','#7258b0','#dc3545','#6c757d'];
Chart.defaults.global.defaultFontColor = "#FFFFFF"
/* large line chart */
var chLine = document.getElementById("chLine");

var socket = io();



var chartData = {
  labels: [],
  datasets: [{
    data: [],
    backgroundColor: 'transparent',
    borderColor: colors[0],
    borderWidth: 1,
    fill: false,
    pointBackgroundColor: colors[0]
  }]
};

for (item in userChartData.rows) {
  chartData.labels.push(userChartData.rows[item][0])
  chartData.datasets[0].data.push(userChartData.rows[item][1])
}

if (chLine) {
window.chart = new Chart(chLine, {
  type: 'line',
  data: chartData,
  options: {
    fill:false,
    maintainAspectRatio: false,
    scales: {
      xAxes: [{
        offset: true,
        gridLines: {
          display:false
        },
        ticks: {
          display: false,
          beginAtZero: false
        }
      }],
      yAxes: [{
        offset: true,
        ticks: {
          display: false,
          beginAtZero: false
        },
        gridLines: {
          display:false
        }
      }]
    },
    legend: {
      display: false
    },
    responsive: true
  }
  });
}


/* bar chart */

pageChartData = JSON.parse(pageChartData)

var barData = {
  labels: [],
  datasets: [{
    data: [],
    backgroundColor: colors[0]
  }]
}

for (item in pageChartData) {
  barData.labels.push(pageChartData[item][0])
  barData.datasets[0].data.push(pageChartData[item][1])
}



var chBar1 = document.getElementById("chBar1");
if (chBar1) {
  new Chart(chBar1, {
    type: 'bar',
    data: barData,
    options: {
      legend: {
        display: false
      },
      maintainAspectRatio: false,
      scales: {
        xAxes: [{
          barPercentage: 0.4,
          categoryPercentage: 0.5,
          ticks: {
            display: false
          },
          gridLines: {
            display:false
          }
        }],
        yAxes: [{
          ticks: {
            display: false
          },
          gridLines: {
            display:false
          }
        }]
      }
    }
  });
}


/* 3 donut charts */
var donutOptions = {
  cutoutPercentage: 85, 
  legend: {position:'bottom', padding:5, labels: {pointStyle:'circle', usePointStyle:true}},
  maintainAspectRatio: false
};

// donut 1
var chDonutData1 = {
    labels: ['In use', 'Avaliable'],
    datasets: [
      {
        backgroundColor: ["#7258b0", "#FFFFF"],
        hoverBackgroundColor: ["#7258b0", "#FFFFF"],
        borderWidth: 0,
        data: [0, 100]
      }
    ]
};

var chDonut1 = document.getElementById("chDonut1");
if (chDonut1) {
  var cpuDonut = new Chart(chDonut1, {
      type: 'pie',
      data: chDonutData1,
      options: donutOptions
  });
}

socket.on('usage', function(data) {
  document.getElementById("cpuUsageVal").innerText = data + "%"
  chDonutData1.datasets[0].data[0] = data
  chDonutData1.datasets[0].data[1] = (100 - data).toFixed(2)
  cpuDonut.update()
})


// donut 2
var chDonutData2 = {
    labels: ['In use', 'Avaliable'],
    datasets: [
      {
        backgroundColor: ["#7258b0", "#FFFFF"],
        hoverBackgroundColor: ["#7258b0", "#FFFFF"],
        borderWidth: 0,
        data: [0, 962.18]
      }
    ]
};
var chDonut2 = document.getElementById("chDonut2");
if (chDonut2) {
  var memDonut = new Chart(chDonut2, {
      type: 'pie',
      data: chDonutData2,
      options: donutOptions
  });
}

socket.on('memdata', function(memoryData) {
  document.getElementById("memoryUsageVal").innerText = (100 - memoryData.freeMemPercentage).toFixed(2) + "%"
  var avaliable = memoryData.totalMemMb - memoryData.usedMemMb
  chDonutData2.datasets[0].data[1] = avaliable.toFixed(2)
  chDonutData2.datasets[0].data[0] = memoryData.usedMemMb
  memDonut.update()
})

// donut 3
var chDonutData3 = {
    labels: ['Used', 'Free'],
    datasets: [
      {
        backgroundColor: colors.slice(0,3),
        borderWidth: 0,
        data: [0, 37]
      }
    ]
};
var chDonut3 = document.getElementById("chDonut3");
if (chDonut3) {
  var diskDonut = new Chart(chDonut3, {
      type: 'pie',
      data: chDonutData3,
      options: donutOptions
  });
}

socket.on('diskUsage', function(diskData) {
  document.getElementById("storageVal").innerText = diskData.usedGb + "gb"
  chDonutData3.datasets[0].data[0] = diskData.usedGb
  chDonutData3.datasets[0].data[1] = diskData.freeGb
  diskDonut.update()
}) 

socket.on('siteStatus', function(data) {
  document.getElementById("statusText").innerText = data.status ? "Up" : "Offline"
  document.getElementById("statusText").style.color = data.status ? "#3aa64b" : "#c14f4f"
  document.getElementsByClassName("statusCircle")[0].style.backgroundColor = data.status ? "#27ac3b" : "#c14f4f"
})


var netChartOptions = {
  fill:true,
  maintainAspectRatio: false,
  legend: {
    display: false
  },
  responsive: true,
  scales: {
    xAxes: [{
      offset: false,
      gridLines: {
        display:false
      },
      ticks: {
        display: false,
        beginAtZero: true
      }
    }],
    yAxes: [{
      ticks: {
          suggestedMin: 0,
          suggestedMax: 10
      }
  }]
  },
}

var sentData = {
  label: "Bytes sent",
  borderWidth: 1,
  data: [0],
  borderColor: '#c6c6c6',
  backgroundColor: 'rgba(198,198,198,0.04047619047619044)'
}

var recievedData = {
  backgroundColor: 'rgba(114,88,176,0.1595238095238095)',
  borderWidth: 1,
  label: "Bytes recieved",
  data: [0],
  borderColor: '#7258b0'
}

var networkData = {
  labels: [new Date()],
  datasets: [recievedData, sentData]
}


var lineElem = document.getElementById("networkLine")
if (lineElem) {
  var networkLine = new Chart(lineElem, {
    type: 'line',
    data: networkData,
    options: netChartOptions
  })
}

socket.on('netData', function(network) {
  var input = network[1].inputBytes / 1048576
  var output = network[1].outputBytes / 1048576
  document.getElementById("recievedVal").innerText = input.toFixed(0) + "mb"
  document.getElementById("sentVal").innerText = output.toFixed(0) + "mb"
  if (networkData.labels.length > 20) {
    sentData.data.splice(0, 1)
    recievedData.data.splice(0, 1)
    networkData.labels.splice(0, 1)
  }
  sentData.data.push(output.toFixed(0))
  recievedData.data.push(input.toFixed(0))
  networkData.labels.push(new Date())
  networkLine.update()
}) 


var totalSessions = 0;
var totalCartSessions = 0;
var totalOrderSessions = 0;

//#45484a
updateSessionProgress = () => {
  pCS = (totalCartSessions / totalSessions).toFixed(2) * 100
  pOS = (totalOrderSessions / totalSessions).toFixed(2) * 100
  if (isNaN(pCS) || isNaN(pOS)) {
    pCS = 0
    pOS = 0
  }
  // (pCS == 0) ? 5 : pCS
  $('#cartSessionProgress').text(pCS + "%").css({'width': (pCS == 0) ? 5 + "%" : pCS + "%", "background-color": '#4799eb'})
  $('#orderSessionProgress').text(pOS + "%").css({'width': (pOS == 0) ? 5 + "%" : pOS + "%", "background-color": '#d16767'})
}

socket.on('sessionCount', function(sessions) {
  totalSessions = sessions
  $('#countSessions').text(sessions)
})

socket.on('sessionCartCount', function(cartSessions) {
  totalCartSessions = cartSessions
  $('#cartSessions').text(cartSessions)
}) 

socket.on('getOrderSessions', function(orderSessions) {
  totalOrderSessions = orderSessions
  $('#orderSessions').text(orderSessions)
  updateSessionProgress()
})

socket.on('getSuccessSessions', function(successPages) {
  $('#totalSuccessPages').text(successPages)
})

// { interface: "ens192", inputBytes: "16362529830", outputBytes: "55067971217" }