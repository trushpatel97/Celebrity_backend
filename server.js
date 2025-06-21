require('dotenv').config();
const pgp = require('pg-promise')();
const winston = require('winston');
const express = require('express'); //using express for backend
const bodyParser = require('body-parser');//body parser is used to convert to json
const bcrypt = require('bcrypt-nodejs');//used for hashing the passwords to make them more secure
const cors = require('cors');//allows website communication between two different websites
console.log('DATABASE_URL:', process.env.DATABASE_URL);
const axios = require('axios');
// Initialize the database connection
const db = pgp(process.env.DATABASE_URL);

// Test the connection
db.connect()
  .then((obj) => {
    console.log('Connected to the database successfully');
    obj.done(); // Release the connection
  })
  .catch((error) => {
    console.error('Database connection error:', error);
  });

// Example query
db.any('SELECT NOW()')
  .then((result) => {
    console.log('Query result:', result);
  })
  .catch((error) => {
    console.error('Query error:', error);
  });


const register = require('./controller/register');
const signin = require('./controller/signin');
const profile = require('./controller/profile');
const image = require('./controller/image');

// Use process.env.CLARIFAI_PAT wherever needed for Clarifai API integration.

const app = express();//initializing the app to use express

app.use(cors())//using cors to allow site communication
app.use(bodyParser.json());//parsing to json
const allowedOrigins = ['http://localhost:3000', 'https://celebrityalike-aa43d85f8ff5.herokuapp.com'];
app.use(cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
// Handle preflight requests
app.options('*', cors());
app.get('/', (req, res)=> {//home or root of the site
  res.send(db.users);//send over the database users
})

app.post('/signin', (req,res)=>{signin.handleSignin(req,res,db,bcrypt)})

app.post('/register', (req,res)=>{register.handleRegister(req,res,db,bcrypt)})//dependency injection. Passing in things that register.js will depend on to run properly

app.get('/profile/:id', (req,res)=>{profile.handleProfileGet(req,res,db)})

app.put('/image', (req,res)=>{image.handleImage(req,res,db)})
app.post('/imageurl', (req,res)=>{image.handleAPICall(req,res,db)})

app.listen(process.env.PORT || 3000, ()=> {//listen to port 3000
  console.log('app is running on port 3000');
})

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
  ],
});

logger.info('Application started');
logger.error('An error occurred');