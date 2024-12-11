import React, { useState } from "react";
import TransactionsTable from "./components/TransactionsTable";
import Statistics from "./components/Statistics";
import BarChart from "./components/BarChart";
import PieChart from "./components/PieChart";

const App = () => {
  const [selectedMonth, setSelectedMonth] = useState("3"); // Default to March

  return (
    <div className="min-h-screen bg-black p-6 overflow-hidden">
      <h1 className="text-3xl font-bold text-white text-center mb-6">Transactions Dashboard</h1>
      <div className="flex justify-center mb-6">
        <select
          className="bg-black border border-white text-white rounded-lg shadow-md py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(0, i).toLocaleString("default", { month: "long" })}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-8">
        <Statistics selectedMonth={selectedMonth} />
      </div>
      <div className="mb-8">
        <TransactionsTable selectedMonth={selectedMonth} />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="bg-white shadow-md rounded-lg p-6">
          <BarChart selectedMonth={selectedMonth} />
        </div>
        <div className="bg-white shadow-md rounded-lg p-6">
          <PieChart selectedMonth={selectedMonth} />
        </div>
      </div>
    </div>
  );
};

export default App;