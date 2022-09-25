const express = require('express');
const { bestClientsValidation, bestProfessionValidation } = require('../validation/admin');

const router = express.Router();

/**
 * @returns Returns the profession that earned the most money
 * for any contactor that worked in the query time range.
 */
router.get('/best-profession', async (req, res) => {
  try {
    const { start, end } = await bestProfessionValidation.validateAsync(req.query);

    const sequelize = req.app.get('sequelize');
    const profession = await sequelize.query(
      `
      SELECT Profiles.profession, SUM(Jobs.price) as earned
      FROM Jobs
      JOIN Contracts, Profiles
      ON Jobs.ContractId = Contracts.id AND Contracts.ContractorId = Profiles.id
      WHERE Jobs.paid = True
      AND Jobs.paymentDate BETWEEN ? and ?
      GROUP BY Profiles.profession
      ORDER BY earned DESC
      LIMIT 1
      `,
      {
        replacements: [start, end],
        plain: true,
      },
    );

    res.json(profession);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

/**
 * @returns the clients that paid the most for jobs in the query time period.
 * limit query parameter should be applied, default limit is 2.
 */
router.get('/best-clients', async (req, res) => {
  try {
    const { start, end, limit } = await bestClientsValidation.validateAsync(req.query);

    const sequelize = req.app.get('sequelize');
    const profiles = await sequelize.query(
      `
      SELECT Contracts.ClientId as id, (Profiles.firstName || ' ' || Profiles.lastName) as fullname, SUM(Jobs.price) as paid
      FROM Jobs
      JOIN Contracts, Profiles
      ON Jobs.ContractId = Contracts.id AND Contracts.ClientId = Profiles.id
      WHERE Jobs.paid = True
      AND Jobs.paymentDate BETWEEN ? and ?
      GROUP BY Contracts.ClientId
      ORDER BY paid DESC
      LIMIT ?
      `,
      {
        replacements: [start, end, limit || 2],
        type: sequelize.QueryTypes.SELECT,
      },
    );

    res.json(profiles);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

module.exports = router;
