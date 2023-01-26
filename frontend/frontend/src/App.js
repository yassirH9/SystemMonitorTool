import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from "react";
import { useRef } from "react";
import { useParams } from "react-router-dom";

import ReactApexChart from 'react-apexcharts'
import ApexCharts from 'apexcharts'

function App() {
  const [chartData, setChartData] = useState({
    series: [{ data: [] }],
    options: {
      chart: {
        type: 'line',
      },
      xaxis: {
        type: 'numeric',
        tickAmount: 20,
        tickPlacement: 'off',
        labels: {
          show: false,
        }
      },
    },
  });

  const updateChartData = (newData) => {
    setChartData((prevData) => {
      return {
        ...prevData,
        series: [{ data: [...prevData.series[0].data, newData] }],
      };
    });
  };

  const ws = useRef();//para recargar el componente si se detecta un cambio
  const [websocketValue, setWebsocketValue] = useState(0);
  useEffect(() => {
    ws.current = new WebSocket("ws:localhost:8080")

    //se abre la conexion 
    ws.current.onopen = () => {
      console.log("Successfully  connected!");
    }
    ws.current.onmessage = (message) => {

      setWebsocketValue(JSON.parse(message.data));
      updateChartData(JSON.parse(message.data).Load);
    }
  }, []);//con los corchetes vacios solo se ejecuta la primera vez, si tiene alguna variable los corchete se ejecutara cada vez que haya un cambio en la variable

  const handleSubmit = (event) => {
    event.preventDefault();
    const message = event.target.message.value
    ws.current.send(JSON.stringify({ message: message }));
  }

  return (
    <>
      <div>
        <ReactApexChart options={chartData.options} series={chartData.series} type="line" height={350} />
      </div>
      <div className='data-container'>
        <div className='iner-data-container'>
          <h1>CPU</h1>
          <h2 id="cpu-usage">CPU usage: {websocketValue.Load}%</h2>
          <h2>{websocketValue.Manufacturer} {websocketValue.Brand}</h2>
          <h2>Speed: @{websocketValue.Speed}Ghz</h2>
          <h2>Cores: {websocketValue.PhysicalCores}</h2>
        </div>
        <div className='iner-data-container'>
          <h1>RAM</h1>
          <h2>Free RAM: {(websocketValue.FreeMem / 1e+9).toFixed(2)}GB</h2>
          <h2>Used RAM: {(websocketValue.UsedMem / 1e+9).toFixed(2)}GB</h2>
          <h2>RAM installed: {Math.floor(((websocketValue.UsedMem + websocketValue.FreeMem) / 1e+9))}GB</h2>
        </div>
        <div className='iner-data-container'>
          <h1>Batery</h1>
          <h2>Charge: {websocketValue.BateryPercent}%</h2>
        </div>
      </div>
    </>
  );
}
export default App;

/*

{"load":"100","cpuinfo":{"manufacturer":"Intel","brand":"Core™ i5-1035G1","vendor":"GenuineIntel","family":"6","model":"126","stepping":"5","revision":"32261","voltage":"","speed":1,"speedMin":1,"speedMax":1.2,"governor":"","cores":8,"physicalCores":4,"performanceCores":8,"efficiencyCores":0,"processors":1,"socket":"Other","flags":"de pse mce sep mtrr mca cmov psn clfsh ds acpi mmx fxsr sse sse2 ss htt tm ia64 pbe","virtualization":true,"cache":{"l1d":192,"l1i":128,"l2":2097152,"l3":6291456}}}
*/