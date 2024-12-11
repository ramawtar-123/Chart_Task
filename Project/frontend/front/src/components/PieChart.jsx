import React, { useState, useEffect } from "react";
import axios from "axios";
import { Pie } from "react-chartjs-2";
import { Chart, ArcElement, Tooltip, Legend } from "chart.js";

// Register necessary components
Chart.register(ArcElement, Tooltip, Legend);

const PieChart = ({ selectedMonth }) => {
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchChartData();
  }, [selectedMonth]);

  const fetchChartData = async () => {
    setIsLoading(true);
    try {
      const { data } = await axios.get("http://localhost:5000/api/pie-chart", {
        params: { month: selectedMonth },
      });
      setChartData(data);
    } catch (error) {
      console.error("Error fetching chart data:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const labels = chartData.map((item) => item._id);
  const counts = chartData.map((item) => item.count);

  const chartOptions = {
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#4A5568",
          font: {
            size: 14,
          },
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false, // Ensures consistent chart size
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="max-w-lg w-full bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-700 mb-4 text-center">
          Transactions Pie Chart
        </h2>
        {isLoading ? (
          <div className="flex items-center justify-center h-48">
            <p className="text-gray-500">Loading chart...</p>
          </div>
        ) : chartData.length > 0 ? (
          <div className="relative" style={{ height: "400px", width: "100%" }}>
            <Pie
              data={{
                labels,
                datasets: [
                  {
                    data: counts,
                    backgroundColor: [
                      "#FF6384",
                      "#36A2EB",
                      "#FFCE56",
                      "#4BC0C0",
                      "#9966FF",
                    ],
                    hoverOffset: 6,
                  },
                ],
              }}
              options={chartOptions}
            />
          </div>
        ) : (
          <div className="flex items-center justify-center h-48">
            <p className="text-gray-500">No data available for the selected month.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PieChart;
