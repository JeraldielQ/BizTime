const express = require("express");
const ExpressError = require("../expressError")
const router = express.Router();
const db = require("../db");

router.get('/', async (req, res, next) => {
    try {
      const result = await db.query('SELECT code, name FROM companies');
      const companies = result.rows;
      return res.json({ companies });
    } catch (e) {
      return next(e);
    }
  });
  
  router.get('/:code', async (req, res, next) => {
    try {
      const { code } = req.params;
  
      const companyResult = await db.query(
        'SELECT * FROM companies LEFT JOIN company_industries ON companies.code = company_industries.company_code LEFT JOIN industries ON industries.code = company_industries.industry_code WHERE companies.code = $1',
        [code]
      );
  
      if (companyResult.rows.length === 0) {
        throw new ExpressError(`Company with code '${code}' not found`, 404);
      }
  
      const company = companyResult.rows[0];
      const industries = companyResult.rows.map(row => ({
        code: row.industry_code,
        industry: row.industry
      }));
  
      company.industries = industries;
  
      return res.json({ company });
    } catch (e) {
      return next(e);
    }
  });
  

router.post('/', async (req, res, next) => {
    try {
      const { code, name, description } = req.body;
      const result = await db.query(
        'INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description',
        [code, name, description]
      );
      const newCompany = result.rows[0];
      return res.status(201).json({ company: newCompany });
    } catch (e) {
      return next(e);
    }
  });
  

router.put('/:code', async (req, res, next) => {
    try {
      const { code } = req.params;
      const { name, description } = req.body;
      const result = await db.query(
        'UPDATE companies SET name = $1, description = $2 WHERE code = $3 RETURNING code, name, description',
        [name, description, code]
      );
  
      if (result.rows.length === 0) {
        throw new ExpressError(`Company with code '${code}' not found`, 404);
      }
  
      const updatedCompany = result.rows[0];
      return res.json({ company: updatedCompany });
    } catch (e) {
      return next(e);
    }
  });
  
router.delete('/:code', async (req, res, next) => {
    try {
      const { code } = req.params;
      const result = await db.query('DELETE FROM companies WHERE code = $1 RETURNING code', [code]);
  
      if (result.rows.length === 0) {
        throw new ExpressError(`Company with code '${code}' not found`, 404);
      }
  
      return res.json({ status: "deleted" });
    } catch (e) {
      return next(e);
    }
  });
  
  router.post('/industries', async (req, res, next) => {
    try {
      const { code, industry } = req.body;
  
      const result = await db.query(
        'INSERT INTO industries (code, industry) VALUES ($1, $2) RETURNING code, industry',
        [code, industry]
      );
  
      const newIndustry = result.rows[0];
  
      return res.status(201).json({ industry: newIndustry });
    } catch (e) {
      return next(e);
    }
  });

  router.get('/industries', async (req, res, next) => {
    try {
      const result = await db.query(
        'SELECT industries.code, industries.industry, array_agg(company_industries.company_code) AS company_codes FROM industries LEFT JOIN company_industries ON industries.code = company_industries.industry_code GROUP BY industries.code, industries.industry'
      );
  
      const industries = result.rows;
  
      return res.json({ industries });
    } catch (e) {
      return next(e);
    }
  });

  router.post('/:code/industries', async (req, res, next) => {
    try {
      const { code } = req.params;
      const { industryCode } = req.body;
  
      const result = await db.query(
        'INSERT INTO company_industries (company_code, industry_code) VALUES ($1, $2)',
        [code, industryCode]
      );
  
      return res.status(201).json({ message: 'Industry associated with company successfully' });
    } catch (e) {
      return next(e);
    }
  });



  module.exports = router;