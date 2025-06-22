// Use the latest Clarifai gRPC SDK
const { ClarifaiStub, grpc } = require('clarifai-nodejs-grpc');

const PAT = process.env.CLARIFAI_PAT;
const USER_ID = process.env.CLARIFAI_USER_ID || 'clarifai';
const APP_ID = process.env.CLARIFAI_APP_ID || 'main';
const MODEL_ID = 'celebrity-face-recognition';
const MODEL_VERSION_ID = '0676ebddd5d6413ebdaa101570295a39';

const stub = ClarifaiStub.grpc();
const metadata = new grpc.Metadata();
metadata.set('authorization', 'Key ' + PAT);

const handleAPICall = (req, res) => {
    const imageUrl = req.body.input;
    stub.PostModelOutputs(
        {
            user_app_id: {
                user_id: USER_ID,
                app_id: APP_ID
            },
            model_id: MODEL_ID,
            version_id: MODEL_VERSION_ID,
            inputs: [
                { data: { image: { url: imageUrl, allow_duplicate_url: true } } }
            ]
        },
        metadata,
        (err, response) => {
            if (err) {
                return res.status(400).json({ error: 'Clarifai API error', details: err.toString() });
            }
            if (response.status.code !== 10000) {
                return res.status(400).json({ error: 'Post model outputs failed', details: response.status.description });
            }
            const output = response.outputs[0];
            // Check for regions and concepts
            if (output.data && Array.isArray(output.data.regions) && output.data.regions.length > 0) {
                return res.json(output);
            } else {
                return res.status(200).json({ error: 'No face or celebrity detected', regions: [] });
            }
        }
    );
};

const handleImage = (req, res, db) => {//updating the counter so it is put
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
