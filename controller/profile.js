const handleProfileGet = (req, res,db) => {//we have to get the "id" 
    const { id } = req.params;//getting the id from the parameters of url 
    db.select('*').from('users').where({id})//select all field from users where the id matches (there should only be 1)
      .then(user => {//get the user 
        if (user.length) {//if the user length is not 0 then
          res.json(user[0])//return the user
        } else {
          res.status(400).json('Not found')//else we did not find the user
        }
      })
      .catch(err => res.status(400).json('error getting user'))//display error
  }

  module.exports = {
      handleProfileGet
  }