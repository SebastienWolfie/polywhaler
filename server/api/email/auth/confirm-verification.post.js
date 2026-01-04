import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'jnkjnjkjnhbjhbyubyhiuh89h89ui87g6uhbutyv7tby67g87huih89h97ug867g78hiugh78yv5erd546f5td5';

export default defineEventHandler(async (event) => {

const allowedOrigins = [
    'http://localhost:3001', 
    'https://polyaccountverify.web.app'
  ];

  // 2. Get the origin of the current request
  const origin = getHeader(event, 'origin');

  // 3. If the origin is in our list, allow it
  if (origin && allowedOrigins.includes(origin)) {
    setResponseHeaders(event, {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Add-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Credentials': 'true',
    });
  }

  // 4. Handle the Preflight (OPTIONS) request
  if (event.method === 'OPTIONS') {
    event.node.res.statusCode = 204;
    return '';
  }
  const { token } = await readBody(event);
  
  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // TODO: Update your Database here!
    // Example: await db.users.update({ email: decoded.email }, { isVerified: true });
    
    return { success: true, email: decoded.email };
  } catch (err) {
    throw createError({ statusCode: 401, message: 'Invalid or expired token' });
  }
});