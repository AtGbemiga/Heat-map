let url = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json'
let req = new XMLHttpRequest
let mv;
let baseTemp;
let values = [] //api data

let xScale 
let yScale

let width = 1000
let height = 600
let padding = 60

let svg = d3.select('#main')
let tooltip = d3.select('#tooltip')

const drawCanvas = () => {
    svg.attr('width', width)
    svg.attr('height', height)
}

const generateScales = () => {
    xScale = d3.scaleLinear()
        .domain([d3.min(mv, item => {
            return item.year
        }), d3.max(mv, item => {
            return item.year
        })])
        .range([padding, width - padding])

    yScale = d3.scaleTime()
        .domain([new Date(0, 0, 0, 0, 0, 0, 0), new Date(0, 12, 0, 0, 0, 0, 0)])
        .range([padding, height - padding])
}

const plotHeatMap = () => {
    svg.selectAll('rect')
        .data(mv)
        .enter()
        .append('rect')
        .attr('class','cell')
        .attr('fill', item => {
            if(item.variance <= -1) {
                return 'blue'
            } else if (item.variance <= 0) {
                return 'black'
            } else if (item.variance <= 1) {
                return 'green'
            } else {
                return 'red'
            }
        })
        .attr('data-month', item => {
            return item.month - 1
        })
        .attr('data-year', item => {
            return item.year
        })
        .attr('data-temp', item => {
            return baseTemp + item.variance
        })
        .attr('height', item => {
            return (height - (2 * padding)) / 12
        })
        .attr('width', item => {
            return (width - (2 * padding)) / item.year
        })
        .attr('y', item => {
            return yScale(new Date(0, item['month'] - 1, 0, 0, 0, 0, 0))
        })
        .attr('x', item => {
            return xScale(item.year)
        })
        .on('mouseover', item => {
            tooltip.style('visibility', 'visible')
            let itemdotmonth = item.month
            function getMonth(itemdotmonth) {
                const date = new Date();
                date.setMonth(itemdotmonth - 1);
              
                return date.toLocaleString('en-US', { month: 'long' });
              }
            if (item.year != '') {
                tooltip.html(`${item.year} ${getMonth(item.month)}: ${8.66 + item.variance}℃`)
                tooltip.attr('data-year', item.year)
            } else {
                return ''
            }
        })
        .on('mouseout', item => {
            tooltip.style('visibility', 'hidden')
        })
}

const generateAxis = () => {
    let xAxis = d3.axisBottom(xScale)
        .tickFormat(d3.format('d')) 
    svg.append('g')
        .call(xAxis)
        .attr('id', 'x-axis')
        .attr('transform', `translate(0, ${height - padding})`)

    let yAxis = d3.axisLeft(yScale)
        .tickFormat(d3.timeFormat('%B'))
    svg.append('g')
        .call(yAxis)
        .attr('id', 'y-axis')
        .attr('transform', `translate(${padding}, 0)`)
}

req.open('GET', url, true)
req.onload = () => {
    values = JSON.parse(req.responseText)
    console.log(values)
    mv = values.monthlyVariance
    baseTemp = values.baseTemperature
    drawCanvas()
    generateScales()
    plotHeatMap()
    generateAxis()
}
req.send()