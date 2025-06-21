const express = require('express'); //using express for backend
const bodyParser = require('body-parser');//body parser is used to convert to json
const bcrypt = require('bcrypt-nodejs');//used for hashing the passwords to make them more secure
const cors = require('cors');//allows website communication between two different websites
const knex = require('knex')//allows us to connect our database to the backend

const register = require('./controller/register');
const signin = require('./controller/signin');
const profile = require('./controller/profile');
const image = require('./controller/image');

require('dotenv').config();

const db = knex({//using knex
  client: 'pg',//we will be using postgreSQL 
  connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: {
    rejectUnauthorized: false,
    }
  },
});

const app = express();//initializing the app to use express

app.use(cors())//using cors to allow site communication
app.use(bodyParser.json());//parsing to json

app.get('/', (req, res) => {
  res.send('Backend is running!');
})

app.post('/signin', (req,res)=>{signin.handleSignin(req,res,db,bcrypt)})

app.post('/register', (req,res)=>{register.handleRegister(req,res,db,bcrypt)})//dependency injection. Passing in things that register.js will depend on to run properly

app.get('/profile/:id', (req,res)=>{profile.handleProfileGet(req,res,db)})

app.put('/image', (req,res)=>{image.handleImage(req,res,db)})
app.post('/imageurl', (req,res)=>{image.handleAPICall(req,res,db)})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`app is running on port ${PORT}`);
});
app.on('error', (err) => {
  console.error('Server error:', err);
});