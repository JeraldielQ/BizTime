const express = require("express");
const app = express();
const ExpressError = require("./expressError");

app.use(express.json());

// Import the companies route
const companiesRoutes = require("./routes/companies");

// Mount the companies routes
app.use("/companies", companiesRoutes);

const invoicesRouter = require('./routes/invoices');

// ...

app.use('/invoices', invoicesRouter);

/** 404 handler */
app.use(function (req, res, next) {
  const err = new ExpressError("Not Found", 404);
  return next(err);
});

/** general error handler */
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  return res.json({
    error: err,
    message: err.message,
  });
});

module.exports = app;
