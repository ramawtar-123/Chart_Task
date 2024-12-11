import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Chart, BarElement, CategoryScale, LinearScale } from "chart.js";

Chart.register(BarElement, CategoryScale, LinearScale);

const BarChart = ({ selectedMonth }) => {
  const chartRef = useRef(null);
  const [chartInstance, setChartInstance] = useState(null);
  const [chartData, setChartData] = useState([]);



  useEffect(() => {
    fetchChartData();
  }, [selectedMonth]);

  const fetchChartData = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/bar-chart", {
        params: { month: selectedMonth },
      });
      setChartData(data);
    } catch (error) {
      console.error("Error fetching chart data:", error.message);
    }
  };

  useEffect(() => {
    if (!chartRef.current) return;

    // Destroy existing chart instance if it exists
    if (chartInstance) {
      chartInstance.destroy();
    }

    // Prepare data for the chart
    const labels = chartData.map((item) => item.range);
    const counts = chartData.map((item) => item.count);

    const newChartInstance = new Chart(chartRef.current, {
      type: "bar",
      data: {
        labels,
        datasets: [
          {
            label: "Price Ranges",
            data: counts,
            backgroundColor: "rgba(75, 192, 192, 0.6)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            beginAtZero: true,
          },
          y: {
            beginAtZero: true,
          },
        },
      },
    });

    setChartInstance(newChartInstance);

    // Cleanup when the component unmounts or updates
    return () => {
      if (newChartInstance) {
        newChartInstance.destroy();
      }
    };
  }, [chartData]);

  return (
    <div style={{ height: "400px", width: "100%" }}>
      <canvas ref={chartRef}></canvas>
    </div>
  );
};

export default BarChart;
