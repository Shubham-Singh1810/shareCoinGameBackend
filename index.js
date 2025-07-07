require("dotenv").config();
const express = require("express");
const cors = require("cors");
const path = require("path");
const routes = require("./src/route");
const mongoose = require("mongoose");

const app = express();

app.use(cors());
app.options("*", cors()); 

// Body parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());


app.use('/uploads', express.static('uploads'));


mongoose.connect(process.env.DB_STRING).then(() => {
  console.warn("DB connection done again");
});

// Routes
app.get("/", (req, res) => res.send(`Server listing on port ${process.env.PORT}`));
app.use("/api", routes);
app.all("*", (req, res) => res.status(404).json({ error: "404 Not Found" }));

// Start Server
const PORT = process.env.PORT || 7000;
app.listen(PORT, () => {
  console.log(`Server running on ${process.env.BACKEND_URL}`);
});
