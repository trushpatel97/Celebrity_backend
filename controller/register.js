const handleRegister = (req, res, db, bcrypt) => {//on the register page, handle code below
  console.log('Register request body:', req.body);
  const { email, name, password } = req.body;//get the object after submitting input boxes
    if(!email||!name||!password){
        return res.status(400).json({ error: 'Please enter all fields' });
    }
    const hash = bcrypt.hashSync(password);//encrypt password
      db.transaction(trx => {//we use transaction because we are trying to add info to two seperate tables "login" and "users"
        trx.insert({//trx is equivalent to using db. Except it allows us to insert into two tables.
          hash: hash,
          email: email
        })
        .into('login')//adding it to login
        .returning('email')//returning the email
        .then(loginEmail => {//with the login email, 
          return trx('users')//return the users
            .returning('*')//selecting all fields
            .insert({//inserting the login email, name, and the date they created
              email: loginEmail[0],
              name: name,
              joined: new Date()
            })
            .then(user => {
              if (user && user[0] && user[0].id) {
                console.log('Register success, sending user:', user[0]);
                res.json(user[0]);//respond with the user we registered
              } else {
                console.error('Register failed, user object missing id:', user);
                res.status(400).json({ error: 'Registration failed, user not created' });
              }
            });
        })
        .then(trx.commit)//add changes to both tables
        .catch(trx.rollback)//if we cant add to both tables for whatever reason, revert all changes and ignore
      })
      .catch(err => {
        console.error('Register error:', err);
        res.status(400).json({ error: 'unable to register', details: err.toString() });
      });//throw error
  }

  module.exports = {
      handleRegister
  }
