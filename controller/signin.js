const handleSignin = async (req, res, db, bcrypt) => {
  const { email, password } = req.body;
  
  // Input validation is already handled by express-validator in routes
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Find user login credentials
    const loginData = await db('login')
      .select('hash')
      .where('email', '=', email)
      .first();

    if (!loginData) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Compare password with hash
    const isValid = await bcrypt.compare(password, loginData.hash);
    
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Get user data
    const user = await db('users')
      .select('id', 'name', 'email', 'joined', 'entries')
      .where('email', '=', email)
      .first();

    if (!user) {
      return res.status(500).json({ error: 'User not found' });
    }

    // Return user data (without sensitive info)
    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      joined: user.joined,
      entries: user.entries || 0
    });

  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ 
      error: 'Signin failed',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  handleSignin
};
