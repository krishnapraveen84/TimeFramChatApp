import React, { useState, useEffect } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import html2canvas from 'html2canvas';
import './index.css';
import { MdZoomIn } from "react-icons/md";
import { MdOutlineZoomOut } from "react-icons/md";
import { MdCloudDownload } from "react-icons/md";
        

function App() {
  const [data, setData] = useState([]);
  const [timeframe, setTimeframe] = useState('daily');
  const [zoom, setZoom] = useState(5);
  const buttonsIds = {
    "daily" : 1,
    "weekly": 2,
    "month": 3
  }
  const  [activeId, setActiveId] = useState(buttonsIds.daily)

  useEffect(() => {
    fetch('/data.json')
      .then(response => response.json())
      .then(data => newFormattedData(data));
  }, []);

  const newFormattedData = (data) => {    
    const newData = data.map(each => ({"timestamp": new Date(each["timestamp"]).toLocaleDateString(), "value": each.value}))
    setData(newData)
  }

  const filterData = (data, timeframe) => {
    if (timeframe === 'daily') {
      return data; 
    } else if (timeframe === 'weekly') {
      // Aggregate data by week (took help here from internet)
      return data.reduce((acc, point, index) => {
        const weekIndex = Math.floor(index / 7);
        if (!acc[weekIndex]) {
          acc[weekIndex] = { timestamp: point.timestamp, value: 0, count: 0 };
        }
        acc[weekIndex].value += point.value;
        acc[weekIndex].count += 1;
        return acc;
      }, []).map(point => ({ ...point, value: point.value / point.count }));
    } else if (timeframe === 'monthly') {
      // Aggregate data by month (took help here from internet)
      return data.reduce((acc, point) => {
        const month = new Date(point.timestamp).getMonth();
        if (!acc[month]) {
          acc[month] = { timestamp: point.timestamp, value: 0, count: 0 };
        }
        acc[month].value += point.value;
        acc[month].count += 1;
        return acc;
      }, []).map(point => ({ ...point, value: point.value / point.count }));
    }
    return data;
  };

  const handleClick = (data) => {
    alert(`Date: ${data.timestamp}\nValue: ${data.value}`);
  };

  const setDaily = () => {
    setActiveId(buttonsIds.daily)
    setTimeframe('daily')

  }
  const setWeekly = () => {
    setActiveId(buttonsIds.weekly)
    setTimeframe('weekly')
  }
  const setMonthly = () => {
    setActiveId(buttonsIds.month)
    setTimeframe('monthly')

  }

  const exportChart = () => {
    const chart = document.getElementById('chart');
    html2canvas(chart).then(canvas => {
      const link = document.createElement('a');
      link.download = 'chart.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
    });
  };

  const handleZoomIn = () => {
    setZoom(prevZoom => Math.min(prevZoom + 1, data.length));
  };

  const handleZoomOut = () => {
    setZoom(prevZoom => Math.max(prevZoom - 1, 1));
  };
  
  return (
    <div className="chart-bg-container">
      <nav className='nav-bar'>
        <p className='nav-text'>TimeFrame Chart</p>
      </nav>
      <div className="controls">
        <button className={`btn ${activeId === 1 ? "active" : ""}`} onClick={setDaily}>Daily</button>
        <button className={`btn ${activeId === 2 ? "active" : ""}`} onClick={setWeekly}>Weekly</button>
        <button className={`btn ${activeId === 3 ? "active" : ""}`} onClick={setMonthly}>Monthly</button>
      </div>
      <div className='chart-container'>
        <div className='zoom-container'>
            <button className='btn btn-zoom' onClick={handleZoomIn}><MdZoomIn className='icon' /></button>
            <button className='btn btn-zoom' onClick={handleZoomOut}><MdOutlineZoomOut className='icon' /></button>
        </div>
        <ResponsiveContainer id="chart" width="100%" height={500}>
            <LineChart
            data={filterData(data, timeframe).slice(0, zoom)}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
            <CartesianGrid strokeDasharray="3 5" stroke="#FFFED3" strokeWidth={2} />
            <XAxis dataKey="timestamp" strokeDasharray="3 5" stroke="#FFFED3" strokeWidth={2} />
            <YAxis  strokeDasharray="3 5" stroke="#FFFED3" strokeWidth={2}/>
            <Tooltip animationEasing="ease-out" />
            <Legend iconSize={22} strokeWidth={22} />
            <Line type="monotone" isAnimationActive={true} dataKey="value" strokeWidth={2} stroke="#910A67" activeDot={{ r: 10  , stroke: 'white' }} onClick={handleClick} />
            </LineChart>
        </ResponsiveContainer>
        <div className='download-div'><span className='export-text'>Export</span><button className='btn btn-download' onClick={exportChart}><MdCloudDownload className='icon' /></button> </div>
      </div>
    </div>
  );
}

export default App;
