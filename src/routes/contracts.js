const express = require('express');
const { Op } = require('sequelize');

const router = express.Router();

/**
 * @returns the contract information only if it belongs to the user
 */
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { profile } = req;
  const { Contract } = req.app.get('models');

  const contract = await Contract.findOne({
    where: {
      id,
      [Op.or]: [
        { ClientId: profile.id },
        { ContractorId: profile.id },
      ],
    },
  });

  if (!contract) return res.status(404).end();

  res.json(contract);
});

/**
 * @returns a list of contracts belonging to a user,
 * the list contains only non terminated contracts.
 */
router.get('/', async (req, res) => {
  const { profile } = req;
  const { Contract } = req.app.get('models');

  const contracts = await Contract.findAll({
    where: {
      status: ['new', 'in_progress'],
      [Op.or]: [
        { ClientId: profile.id },
        { ContractorId: profile.id },
      ],
    },
  });

  res.json(contracts);
});

module.exports = router;
