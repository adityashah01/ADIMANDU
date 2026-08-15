const prisma = require('./src/lib/prisma');

async function run() {
  const bookings = await prisma.booking.findMany({
    where: { paymentStatus: { in: ['ESCROW_HELD', 'RELEASED'] } },
    include: { transactions: true },
  });

  const requests = await prisma.serviceRequest.findMany({
    where: { paymentStatus: { in: ['ESCROW_HELD', 'RELEASED'] } },
    include: { transactions: true },
  });

  console.log('Bookings with payment:', bookings.length);
  console.log('Service requests with payment:', requests.length);
  
  // Check all distinct payment statuses
  const allBookings = await prisma.booking.findMany({ select: { paymentStatus: true } });
  const statuses = [...new Set(allBookings.map(b => b.paymentStatus))];
  console.log('All booking paymentStatuses in DB:', statuses);
  
  const allReqs = await prisma.serviceRequest.findMany({ select: { paymentStatus: true } });
  const reqStatuses = [...new Set(allReqs.map(r => r.paymentStatus))];
  console.log('All serviceRequest paymentStatuses in DB:', reqStatuses);

  process.exit(0);
}
run().catch(e => { console.error(e); process.exit(1); });

async function run2() {
  // Show what's actually in the DB
  const allBookings = await prisma.booking.findMany({
    select: { id: true, paymentStatus: true, paymentMethod: true, quotedPrice: true, status: true },
    take: 5
  });
  console.log('Sample bookings:', JSON.stringify(allBookings, null, 2));

  const allReqs = await prisma.serviceRequest.findMany({
    select: { id: true, paymentStatus: true, paymentMethod: true, finalAmount: true, status: true },
    take: 5
  });
  console.log('Sample service requests:', JSON.stringify(allReqs, null, 2));
}
run2().catch(e => { console.error(e); process.exit(1); });
