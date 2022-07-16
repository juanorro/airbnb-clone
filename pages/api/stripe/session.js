import { calcTotalCostOfStay } from "lib/cost";
import prisma from "lib/prisma";

export default async(req, res) => {

  if(req.method !== 'POST') {
    res.status(405).end();
    return;
  };

  const amount = calcTotalCostOfStay(new Date(req.body.from), new Date(req.body.to)) * 100;

  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const stripe_session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        name: 'Purchase nights from ' + new Date(req.body.from).toDateString() +
          'to' + new Date(req.body.to).toDateString(),
        amount: amount,
        currency: 'eur',
        quantity: 1,
      },
    ],
    success_url: process.env.BASE_URL + '/success',
    cancel_url: process.env.BASE_URL + '/calendar',
  });

  await prisma.booking.create({
    data: {
      price: amount,
      sessionId: stripe_session.id,
      from: req.body.from,
      to: req.body.to,
    },
  });

  res.writeHead(200, {
    'Content-Type': 'application/json',
  });

  res.end(
    JSON.stringify({
      status: 'success',
      sessionId: stripe_session.id,
      stripePublicKey: process.env.STRIPE_PUBLIC_KEY,
    }),
  );
};