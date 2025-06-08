const handleRegister = async (req, res, db, bcrypt) => {
  const { email, name, password } = req.body;
  
  // Input validation is already handled by express-validator in routes
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Check if user already exists
    const existingUser = await db('login').where({ email }).first();
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Hash password with bcrypt
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    
    // Use transaction to ensure data consistency
    await db.transaction(async trx => {
      // Insert into login table
      const [loginEmail] = await trx('login')
        .insert({
          email,
          hash,
          created_at: db.fn.now(),
          updated_at: db.fn.now()
        }, ['email']);

      // Insert into users table
      const [user] = await trx('users')
        .insert({
          name,
          email: loginEmail.email,
          created_at: db.fn.now(),
          updated_at: db.fn.now()
        }, ['id', 'name', 'email', 'joined']);

      // Return user data (without sensitive info)
      res.status(201).json({
        id: user.id,
        name: user.name,
        email: user.email,
        joined: user.joined
      });
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Registration failed',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  handleRegister
};
