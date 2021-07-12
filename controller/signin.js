const handleSignin = (req, res,db,bcrypt) => {//on signin we take a req and res. we use req (request) to get the body and res (response) to display user or error
    const {email,password} = req.body;
    if(!email|| !password){
        return res.status(400).json('Please enter all fileds')
    }
    db.select('email', 'hash').from('login')//using knex we select email and hash from login where email = email. Basically getting the unique email 
      .where('email', '=', email)
      .then(data => {//gets data
        const isValid = bcrypt.compareSync(password, data[0].hash);//compare the password in the body to the hashed version
        if (isValid) {//if match
          return db.select('*').from('users')//return all fields from user and its values  where the email matches
            .where('email', '=', email)
            .then(user => {
              res.json(user[0])//respond with the user. We use [0] because there can only be one user that shows up as a result
            })
            .catch(err => res.status(400).json('unable to get user'))//if there is a problem display error
        } else {
          res.status(400).json('wrong credentials')//show that you tried to access the wrong user
        }
      })
      .catch(err => res.status(400).json('wrong credentials'))//same thing 
  }

  module.exports = {
    handleSignin
}
