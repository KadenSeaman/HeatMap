import { useEffect, useState, useRef } from 'react'
import './App.css'
import * as d3 from "d3";

function HeatMap( {dataset, baseTemperature} ) {
  const heatMapReference = useRef(null)

  useEffect(() => {
    //protect against empty dataset
    if(!dataset) return;

    //clears on reload
    d3.select(heatMapReference.current).selectAll("*").remove();

    const month = ['January','February', 'March', 'April', 'May', 'June', 'July', 'August','September','October','November','December']

    //settings
    const margin = {
      left : 100,
      right : 60,
      top: 50,
      bottom: 200,
    }

    //svg
    const width = 1000;
    const height = 800;
  
    const svg = d3.select(heatMapReference.current)
    .append('svg')
    .attr('width', width)
    .attr('height', height);


    //xAxis
    const xAxisScale = d3.scaleLinear()
    .domain([d3.min(dataset, d => d.year), d3.max(dataset, d => d.year)])
    .range([margin.left, width - margin.right]);

    const xAxis = d3.axisBottom(xAxisScale)
    .ticks(20, "d");

    svg.append('g')
    .attr('transform', `translate(0,${height - margin.bottom})`)
    .attr('id', 'x-axis')
    .call(xAxis)

    //xAxisLabel
    svg.append('text')
    .attr('x', width / 2 + 10)
    .attr('y', height - margin.bottom + margin.top)
    .attr('class','axis-label')
    .text('Year')

    //yAxis
    const yAxisScale = d3.scaleLinear()
    .domain([d3.min(dataset, d => d.month) - 0.5, d3.max(dataset, d => d.month) + 0.5])
    .range([margin.top, height - margin.bottom])

    const yAxis = d3.axisLeft(yAxisScale)
    .tickFormat((d,i) => month[d - 1])
    .ticks(12);

    svg.append('g')
    .attr('transform', `translate(${margin.left},0)`)
    .attr('id','y-axis')
    .call(yAxis)

    //yAxisLabel
    svg.append('text')
    .attr('x', -(height - margin.bottom + margin.top)/2)
    .attr('y', margin.left / 3)
    .attr('transform','rotate(-90)')
    .attr('class', 'axis-label')
    .text('Months')

    //cells

    const totalVerticalSpace = height - margin.bottom - margin.top;
    const cellHeight = totalVerticalSpace / 12;

    const minYear = d3.min(dataset, d => d.year);
    const maxYear = d3.max(dataset, d => d.year);

    const numberOfYears = maxYear - minYear;
    const cellWidth = (width - margin.left - margin.right) / numberOfYears; 

    function returnTemperatureColor(temperature){
      if(temperature < 3.9){
        return '#080306b';
      }
      else if (temperature < 5){
        return '#2171b5'
      }
      else if (temperature < 6.1){
        return '#6baed6'
      }
      else if (temperature < 7.2){
        return '#c6dbef';
      }
      else if (temperature < 8.3){
        return '#fffff0';
      }
      else if (temperature < 9.5){
        return '#fcbba1';
      }
      else if (temperature < 10.6){
        return '#fb6a4a';
      }
      else if (temperature < 11.7){
        return '#cb181d';
      }
      else{
        return '#67000d';
      }
    }

    svg.selectAll('rect')
    .data(dataset)
    .enter()
    .append('rect')
    .attr('x', d => xAxisScale(d.year))
    .attr('y', d => yAxisScale(d.month))
    .attr('width', cellWidth)
    .attr('height', cellHeight)
    //if the data-year corresponding test fails this is because this does not account for the fact it overflows on the yaer
    .attr('transform',`translate(0, -${cellHeight/2})`)
    .attr('class','cell')
    .attr('data-month', d => d.month)
    .attr('data-year', d => d.year)
    .attr('data-temp', d => baseTemperature + d.variance)
    .style('fill', d => returnTemperatureColor(d.variance + baseTemperature))


    .on('mouseover', (event, d) => {
      d3.select('.heatmap-container').select('div').remove()

      const tooltipYearMonth = `${d.year} - ${month[d.month - 1]}`;
      const tooltipTemperature = (baseTemperature + d.variance).toFixed(1);
      const tooltipVariance = d.variance.toFixed(1);

      const tooltip = d3.select('.heatmap-container').append('div')
      .html(`<p>${tooltipYearMonth}</p><p>${tooltipTemperature}°C</p><p>${tooltipVariance}°C</p>`)
      .attr('id', 'tooltip')
      .style('display','block')
      .style('left', xAxisScale(d.year) - 60 + 'px')
      .style('top', yAxisScale(d.month) - cellHeight * 3 + 'px')
    })
    .on('mouseout', (event, d) => {
      d3.select('.heatmap-container').select('div')
      .style('display', 'none')
    });


    //legend


  }, [dataset])



  return (
    <div ref={heatMapReference} className="heatmap-container">

    </div>
  )
}

function App() {

  const [dataset, setDataset] = useState({});

  const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json"

  useEffect(() => {
    fetch(url)
    .then(response => response.json())
    // .then(responseJSON => console.log(responseJSON))
    .then(responseJSON => setDataset(responseJSON))
  },[])

  return (
    <div id='container'>
      <h1 id='title'>Monthly Global Land-Surface Temperature</h1>
      <h2 id='description'>1753 - 2015: base temperature {dataset.baseTemperature}°C</h2>
      <HeatMap dataset={dataset.monthlyVariance} baseTemperature={dataset.baseTemperature}/> 
    </div>
  )
}

export default App
