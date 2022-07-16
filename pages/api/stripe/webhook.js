import prisma from 'lib/prisma';
import getRawBody from 'raw-body';

export const config = {
  api: {
    bodyParse: false,
  },
};

export default async (req, res) => {
  console.log('entra webhook');
  if(req.method !== 'POST') {
    res.status(405).end();
    return;
  };


  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const sig = req.headers['stripe-signature'];

  const rawBody = await getRawBody(req, {
    encoding: 'uft-8',
  });

  let event; 

  try {
    event = stripe.webhook.constructEvent(rawBody, sig, endpointSecret); 
  } catch (err) {
    res.writeHead(400, {
      'Content-Type': 'application/json',
    });

    console.log(err.message);

    res.end(
      JSON.stringify({
        status: 'success',
        message: `Webhook Error: ${ err.message }`,
      }),
    );

    return;
  };

  if(event.type === 'checkout.session.completed') {
    const sessionId = event.data.object.id;

    const email = event.data.object.customer_details.email;

    try {
      const booking = await prisma.booking.findFirst({
        where: {
          sessionId,
        },
      });

      await prisma.booking.updateMany({
        data: {
          paid: true,
          sessionId: '',
          email,
        }, 
        where: {
          sessionId,
        },
      }) 
    } catch(err) {
      console.error(err);
    };
  };

  res.writeHead(200, {
    'Content-Type': 'application/json',
  }); 

  res.end(JSON.stringify({ received: true }));
}