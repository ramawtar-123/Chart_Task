const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");
const bodyParser = require("body-parser");
const Transaction = require("./models/Transaction");
require("dotenv").config();

const app = express();
const PORT = 5000;

app.use(bodyParser.json());
app.use(require("cors")());

// Connect to MongoDB using async/await
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
    });
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err.message);
    process.exit(1);
  }
};

// Initialize the database connection
connectDB();

// Initialize database
app.get("/api/init", async (req, res) => {
  try {
    const { data } = await axios.get(
      "https://s3.amazonaws.com/roxiler.com/product_transaction.json"
    );
    await Transaction.insertMany(data);
    res.status(200).send("Database initialized");
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error initializing database");
  }
});

// Transactions list with pagination and search
app.get("/api/transactions", async (req, res) => {
  const { page = 1, perPage = 10, search = "", month } = req.query;
  const regex = new RegExp(search, "i");

  const filter = {
    $or: [
      { title: regex },
      { description: regex },
      // Remove regex from price field
    ],
  };

  if (!isNaN(Number(search))) {
    // If search is a number, add it to the filter for price
    filter.$or.push({ price: Number(search) });
  }


  if (month) {
    const startDate = new Date(`2023-${month}-01`);
    const endDate = new Date(`2023-${parseInt(month) + 1 || 1}-01`);

    if (isNaN(startDate) || isNaN(endDate)) {
      return res.status(400).send("Invalid month provided");
    }

  }

  try {
    const transactions = await Transaction.find(filter)
      .skip((page - 1) * perPage)
      .limit(parseInt(perPage));
    const count = await Transaction.countDocuments(filter);

    res.json({ data: transactions, total: count });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error fetching transactions");
  }
});

// Other APIs remain unchanged but ensure proper async/await error handling
app.get("/api/statistics", async (req, res) => {
  const { month } = req.query;

  // Ensure month is valid
  if (!month || isNaN(month) || month < 1 || month > 12) {
    return res.status(400).send("Invalid month provided. Please provide a month between 1 and 12.");
  }

  // Set the start date (1st of the given month in any year)
  const startDate = new Date(2021, month - 1, 1); // Month is 0-based in JavaScript, so subtract 1
  // Set the end date (last day of the given month at 23:59:59)
  const endDate = new Date(new Date().getFullYear(), month, 0); // Setting the day to 0 gives the last day of the previous month
  endDate.setHours(23, 59, 59, 999); // Ensure the end date is inclusive of the entire last day

  console.log(startDate)
  console.log(endDate)

  // Set a query for the database to cover the full date range for any year
  try {
    // Calculate total sale (sum of prices where sold is true)
    const totalSale = await Transaction.aggregate([
      {
        $match: {
          dateOfSale: { $gte: startDate, $lt: endDate },
          sold: true,
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$price" },
        },
      },
    ]);

    console.log("Total Sale:", totalSale);

    // If no sales are found, set totalSale to 0
    const total = totalSale.length > 0 ? totalSale[0].total : 0;

    // Count of sold items
    const soldCount = await Transaction.countDocuments({
      dateOfSale: { $gte: startDate, $lt: endDate },
      sold: true,
    });

    // Count of not sold items
    const notSoldCount = await Transaction.countDocuments({
      dateOfSale: { $gte: startDate, $lt: endDate },
      sold: false,
    });

    // Send response with the statistics
    res.json({
      totalSale: total,
      soldCount,
      notSoldCount,
    });
  } catch (err) {
    console.error("Error fetching statistics:", err.message);
    res.status(500).send("Error fetching statistics");
  }
});




// Other routes remain unchanged...
// Combined API
app.get("/api/combined", async (req, res) => {
  const { month } = req.query;

  if (!month || isNaN(Number(month)) || month < 1 || month > 12) {
    return res.status(400).send("Invalid month provided");
  }

  try {
    const [transactions, statistics, barChart, pieChart] = await Promise.all([
      axios.get(`${req.protocol}://${req.get("host")}/api/transactions`, {
        params: req.query,
      }),
      axios.get(`${req.protocol}://${req.get("host")}/api/statistics`, {
        params: req.query,
      }),
      axios.get(`${req.protocol}://${req.get("host")}/api/bar-chart`, {
        params: req.query,
      }),
      axios.get(`${req.protocol}://${req.get("host")}/api/pie-chart`, {
        params: req.query,
      }),
    ]);

    res.json({
      transactions: transactions.data,
      statistics: statistics.data,
      barChart: barChart.data,
      pieChart: pieChart.data,
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error fetching combined data");
  }
});

// Pie chart
app.get("/api/pie-chart", async (req, res) => {
  const { month } = req.query;
  const startDate = new Date(`2021-${month}-01`);
  const endDate = new Date(`2024-${parseInt(month) + 1 || 1}-01`);

  if (isNaN(startDate) || isNaN(endDate)) {
    return res.status(400).send("Invalid month provided");
  }

  try {
    const result = await Transaction.aggregate([
      { $match: { dateOfSale: { $gte: startDate, $lt: endDate } } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
    ]);

    res.json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error fetching pie chart data");
  }
});


// Bar chart
app.get("/api/bar-chart", async (req, res) => {
  const { month } = req.query;
  const startDate = new Date(`2021-${month}-01`);
  const endDate = new Date(`2024-${parseInt(month) + 1 || 1}-01`);

  if (isNaN(startDate) || isNaN(endDate)) {
    return res.status(400).send("Invalid month provided");
  }

  const ranges = [
    { range: "0-100", min: 0, max: 100 },
    { range: "101-200", min: 101, max: 200 },
    { range: "201-300", min: 201, max: 300 },
    { range: "301-400", min: 301, max: 400 },
    { range: "401-500", min: 401, max: 500 },
    { range: "501-600", min: 501, max: 600 },
    { range: "601-700", min: 601, max: 700 },
    { range: "701-800", min: 701, max: 800 },
    { range: "801-900", min: 801, max: 900 },
    { range: "901-above", min: 901 },
  ];

  try {
    const result = await Promise.all(
      ranges.map(async ({ range, min, max }) => {
        const count = await Transaction.countDocuments({
          dateOfSale: { $gte: startDate, $lt: endDate },
          price: max ? { $gte: min, $lt: max } : { $gte: min },
        });
        return { range, count };
      })
    );

    res.json(result);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Error fetching bar chart data");
  }
});



app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
