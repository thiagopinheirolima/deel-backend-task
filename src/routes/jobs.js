const express = require('express');
const { Op, literal } = require('sequelize');

const router = express.Router();

/**
 * @returns all unpaid jobs for a user, for active contracts (new, in_progress)
 */
router.get('/unpaid', async (req, res) => {
  const { profile } = req;
  const { Job, Contract } = req.app.get('models');

  const jobs = await Job.findAll({
    where: {
      paid: false,
    },
    include: {
      model: Contract,
      required: true,
      attributes: [],
      where: {
        status: ['new', 'in_progress'],
        [Op.or]: [
          { ClientId: profile.id },
          { ContractorId: profile.id },
        ],
      },
    },
  });

  res.json(jobs);
});

/**
 * Pay for a job, a client can only pay if his balance >= the amount to pay.
 * The amount should be moved from the client's balance to the contractor balance.
 * @returns 200 if everything went well
 */
router.post('/:id/pay', async (req, res) => {
  const { profile } = req;
  const { id } = req.params;
  const { Contract, Job } = req.app.get('models');

  const job = await Job.findOne({
    where: { id },
    include: {
      model: Contract,
      required: true,
      where: { ClientId: profile.id },
      include: 'Contractor',
    },
  });

  if (!job) return res.status(404).end();
  if (job.paid) return res.status(400).send('You cannot pay twice.');
  if (job.Contract.status === 'terminated') return res.status(400).send('You cannot pay after the contract has ended.');
  if (profile.balance < job.price) return res.send(400).send('You dont have enough balance.');

  try {
    const sequelize = req.app.get('sequelize');
    const contractor = job.Contract.Contractor;

    await sequelize.transaction(async (transaction) => {
      await Promise.all([
        await profile.decrement('balance', { by: job.price, transaction }),
        await contractor.increment('balance', { by: job.price, transaction }),
        await job.update({ paid: true, paymentDate: literal('CURRENT_TIMESTAMP') }, { transaction }),
      ]);
    });

    res.end();
  } catch (error) {
    // Would be better to use another logger
    // eslint-disable-next-line no-console
    console.error(error);
    res.status(400).send('Something went wrong');
  }
});

module.exports = router;
