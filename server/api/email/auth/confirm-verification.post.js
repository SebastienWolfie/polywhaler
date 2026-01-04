import jwt from 'jsonwebtoken';
const JWT_SECRET = process.env.JWT_SECRET || 'jnkjnjkjnhbjhbyubyhiuh89h89ui87g6uhbutyv7tby67g87huih89h97ug867g78hiugh78yv5erd546f5td5';

export default defineEventHandler(async (event) => {

handleCors(event, {
    origin: [
      'http://localhost:3001', 
      'https://polyaccountverify.firebaseapp.com'
    ],
    methods: ['POST', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    preflight: {
      statusCode: 204
    }
  });

  // 2. If it's an OPTIONS request, handleCors already sent the response. 
  // We stop execution here for OPTIONS.
  if (event.method === 'OPTIONS') {
    return null;
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