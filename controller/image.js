const Clarifai = require('clarifai');
const { body, validationResult } = require('express-validator');

// Initialize Clarifai with API key from environment variables
const app = new Clarifai.App({
  apiKey: process.env.CLARIFAI_API_KEY || 'YOUR_CLARIFAI_API_KEY'
});

/**
 * Handle API call to Clarifai for celebrity recognition
 */
const handleAPICall = async (req, res) => {
  try {
    // Validate input
    await body('input', 'Image URL is required').isURL().run(req);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { input } = req.body;
    
    // Call Clarifai API
    const data = await app.models.predict(Clarifai.CELEBRITY_MODEL, input);
    
    // Return the API response
    res.json(data);
    
  } catch (error) {
    console.error('Clarifai API error:', error);
    res.status(500).json({
      error: 'Failed to process image',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Handle updating user entry count
 */
const handleImage = async (req, res, db) => {
  try {
    // Validate input
    await body('id', 'User ID is required').isInt({ min: 1 }).run(req);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.body;

    // Update user's entry count and return the new count
    const [updatedUser] = await db('users')
      .where('id', id)
      .increment('entries', 1)
      .returning(['entries']);

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ entries: updatedUser.entries });
    
  } catch (error) {
    console.error('Entry update error:', error);
    res.status(500).json({
      error: 'Failed to update entry count',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get user's current entry count
 */
const getEntryCount = async (req, res, db) => {
  try {
    const { id } = req.params;
    
    // Validate ID
    await body('id', 'Invalid user ID').isInt({ min: 1 }).run(req);
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const user = await db('users')
      .select('entries')
      .where('id', id)
      .first();

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ entries: user.entries || 0 });
    
  } catch (error) {
    console.error('Get entry count error:', error);
    res.status(500).json({
      error: 'Failed to get entry count',
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  handleImage,
  handleAPICall,
  getEntryCount
};
