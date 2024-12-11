import React, { useState, useEffect } from "react";
import axios from "axios";

const TransactionsTable = ({ selectedMonth }) => {
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchTransactions();
  }, [selectedMonth, page, search]);

  const fetchTransactions = async () => {
    const { data } = await axios.get("http://localhost:5000/api/transactions", {
      params: {
        month: selectedMonth,
        page,
        search,
      },
    });
    setTransactions(data.data);
    setTotalPages(Math.ceil(data.total / 10));
  };

  return (
    <div className=" min-h-screen w-screen justify-center items-center">
      <div className="max-w-4xl mx-auto bg-gray-600 shadow-md rounded-lg p-4">
        <input
          type="text"
          placeholder="Search transactions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mb-4 px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-gray-200">
                <th className="py-2 px-4 border">Title</th>
                <th className="py-2 px-4 border">Description</th>
                <th className="py-2 px-4 border">Price</th>
                <th className="py-2 px-4 border">Date</th>
                <th className="py-2 px-4 border">Sold</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction._id} className="hover:bg-gray-500">
                  <td className="py-2 px-4 border">{transaction.title}</td>
                  <td className="py-2 px-4 border">{transaction.description}</td>
                  <td className="py-2 px-4 border">${transaction.price}</td>
                  <td className="py-2 px-4 border">
                    {new Date(transaction.dateOfSale).toLocaleDateString()}
                  </td>
                  <td className="py-2 px-4 border">
                    {transaction.sold ? "Yes" : "No"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => setPage(page > 1 ? page - 1 : 1)}
            disabled={page === 1}
            className={`px-4 py-2 rounded ${
              page === 1
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            Previous
          </button>
          <span>
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(page < totalPages ? page + 1 : totalPages)}
            disabled={page === totalPages}
            className={`px-4 py-2 rounded ${
              page === totalPages
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransactionsTable;