const Clarifai = require('clarifai')
const app = new Clarifai.App({
    apiKey: "de936a5b426743f1b5c5bbdd78f441ff",
});
const handleAPICall=(req,res)=>{
    app.models.predict(Clarifai.CELEBRITY_MODEL,req.body.input)
    .then(data=>{
        res.json(data);
    })
    .catch(err=>res.status(400).json('unable to  work with API'))
}
const handleImage = (req, res,db) => {//updating the counter so it is put
    const { id } = req.body;//we get the entries from the body
    db('users').where('id', '=', id)//find where id matches in the users table
    .increment('entries', 1)//increament the counter by 1
    .returning('entries')//return entries
    .then(entries => {
      res.json(entries[0]);//respond with a json of the entries and display the total entries ONLY
    })
    .catch(err => res.status(400).json('unable to get entries'))//throw error
  }

  module.exports = {
      handleImage,
      handleAPICall
  }
