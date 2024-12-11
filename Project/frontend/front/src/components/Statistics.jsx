import React, { useState, useEffect } from "react";
import axios from "axios";

const Statistics = ({ selectedMonth }) => {
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchStatistics();
  }, [selectedMonth]);

  const fetchStatistics = async () => {
    try {
      const { data } = await axios.get("http://localhost:5000/api/statistics", {
        params: { month: selectedMonth },
      });
      setStats(data);
    } catch (error) {
      console.error("Error fetching statistics:", error.message);
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6 ">
      <div className="bg-gray-700 shadow-md rounded-lg p-6 flex flex-col items-center justify-center">
        <h2 className="text-lg font-semibold text-gray-100">Total Sale</h2>
        <p className="text-2xl font-bold text-green-600">${stats.totalSale || 0}</p>
      </div>

      <div className="bg-gray-700 shadow-md rounded-lg p-6 flex flex-col items-center justify-center">
        <h2 className="text-lg font-semibold text-gray-100">Sold Items</h2>
        <p className="text-2xl font-bold text-blue-600">{stats.soldCount || 0}</p>
      </div>

      <div className="bg-gray-700 shadow-md rounded-lg p-6 flex flex-col items-center justify-center">
        <h2 className="text-lg font-semibold text-gray-100">Not Sold Items</h2>
        <p className="text-2xl font-bold text-red-600">{stats.notSoldCount || 0}</p>
      </div>
    </div>
  );
};

export default Statistics;