const express = require('express');
const { Op } = require('sequelize');
const { depositValidation } = require('../validation/balances');

const router = express.Router();

/**
 * Deposits money into the the the balance of a client,
 * a client can't deposit more than 25% his total of jobs to pay.
 * (at the deposit moment)
 * @body the amount to be deposited
 * @returns 200 if everything went well
 */
router.post('/deposit/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { Profile, Job, Contract } = req.app.get('models');

    const { amount } = await depositValidation.validateAsync(req.body, { convert: false });

    const user = await Profile.findByPk(userId);
    if (!user) return res.status(404).send();

    const totalAmountToPay = await Job.sum('price', {
      where: { paid: false },
      include: {
        model: Contract,
        required: true,
        where: { ClientId: userId, status: { [Op.ne]: 'terminated' } },
      },
    });
    if (!totalAmountToPay) return res.status(400).send('You cannot deposit any amount right now.');

    const maxAmount = Math.floor(totalAmountToPay * 25) / 100;
    if (amount > maxAmount) return res.status(400).send(`You can only deposit a max of ${maxAmount}.`);
    await user.increment('balance', { by: amount });
    res.end();
  } catch (error) {
    res.status(400).send(error.message);
  }
});

module.exports = router;
