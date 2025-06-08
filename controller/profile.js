const { body, validationResult } = require('express-validator');

const handleProfileGet = async (req, res, db) => {
  const { id } = req.params;

  // Validate ID is a positive integer
  await body('id', 'Invalid user ID').isInt({ min: 1 }).run(req);
  
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const user = await db('users')
      .select('id', 'name', 'email', 'joined', 'entries')
      .where('id', id)
      .first();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
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
    console.error('Profile fetch error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch profile',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Add a new function to update profile
const updateProfile = async (req, res, db) => {
  const { id } = req.params;
  const { name, email } = req.body;

  try {
    // Validate input
    await Promise.all([
      body('id', 'Invalid user ID').isInt({ min: 1 }).run(req),
      body('name', 'Name is required').trim().notEmpty().run(req),
      body('email', 'Please include a valid email').isEmail().normalizeEmail().run(req)
    ]);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check if email is already in use by another user
    const emailExists = await db('users')
      .where('email', email)
      .whereNot('id', id)
      .first();

    if (emailExists) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    // Update user
    const [updatedUser] = await db('users')
      .where('id', id)
      .update({
        name,
        email,
        updated_at: db.fn.now()
      }, ['id', 'name', 'email', 'joined']);

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(updatedUser);

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ 
      error: 'Failed to update profile',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  handleProfileGet,
  updateProfile
};