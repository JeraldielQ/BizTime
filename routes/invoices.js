const express = require('express');
const router = express.Router();
const db = require('../db');
const ExpressError = require('../expressError');


router.get('/', async (req, res, next) => {
  try {
    const result = await db.query('SELECT id, comp_code FROM invoices');
    const invoices = result.rows;
    return res.json({ invoices });
  } catch (e) {
    return next(e);
  }
});


router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'SELECT i.id, i.amt, i.paid, i.add_date, i.paid_date, c.code, c.name, c.description FROM invoices AS i JOIN companies AS c ON (i.comp_code = c.code) WHERE i.id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      throw new ExpressError(`Invoice with ID '${id}' not found`, 404);
    }

    const { amt, paid, add_date, paid_date, code, name, description } = result.rows[0];
    const invoice = {id, amt, paid, add_date, paid_date, company: {code, name, description}};
    return res.json({ invoice });
  } catch (e) {
    return next(e);
  }
});


router.post('/', async (req, res, next) => {
  try {
    const { comp_code, amt } = req.body;
    const result = await db.query(
      'INSERT INTO invoices (comp_code, amt) VALUES ($1, $2) RETURNING id, comp_code, amt, paid, add_date, paid_date',
      [comp_code, amt]
    );
    const { id, paid, add_date, paid_date } = result.rows[0];
    const invoice = {
      id,
      comp_code,
      amt,
      paid,
      add_date,
      paid_date,
    };
    return res.status(201).json({ invoice });
  } catch (e) {
    return next(e);
  }
});


router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { amt } = req.body;
    const result = await db.query(
      'UPDATE invoices SET amt = $1 WHERE id = $2 RETURNING id, comp_code, amt, paid, add_date, paid_date',
      [amt, id]
    );

    if (result.rows.length === 0) {
      throw new ExpressError(`Invoice with ID '${id}' not found`, 404);
    }

    const { comp_code, paid, add_date, paid_date } = result.rows[0];
    const invoice = {
      id,
      comp_code,
      amt,
      paid,
      add_date,
      paid_date,
    };

    return res.json({ invoice });
  } catch (e) {
    return next(e);
  }
});


router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM invoices WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      throw new ExpressError(`Invoice with ID '${id}' not found`, 404);
    }

    return res.json({ status: 'deleted' });
  } catch (e) {
    return next(e);
  }
});

module.exports = router;
