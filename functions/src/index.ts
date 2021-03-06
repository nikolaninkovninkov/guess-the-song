import { config as dotconfig } from 'dotenv';
import express from 'express';
import cors from 'cors';
import SpotifyWebApi from 'spotify-web-api-node';
import * as functions from 'firebase-functions';
const app = express();
dotconfig();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const NODE_ENV = 'development' as 'development' | 'production';
const [redirectUri, clientId, clientSecret] =
  NODE_ENV == 'development'
    ? [
        process.env.REDIRECT_URI,
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET,
      ]
    : [
        functions.config().api.redirect_uri,
        functions.config().api.client_id,
        functions.config().api.client_secret,
      ];
if (!redirectUri || !clientId || !clientSecret)
  throw new Error('Invalid credentials in .env file');
app.post('/refresh', (req, res) => {
  const refreshToken = req.body.refreshToken;
  const spotifyApi = new SpotifyWebApi({
    redirectUri: redirectUri,
    clientId: clientId,
    clientSecret: clientSecret,
    refreshToken,
  });

  spotifyApi
    .refreshAccessToken()
    .then((data) => {
      res.json({
        accessToken: data.body.access_token,
        expiresIn: data.body.expires_in,
      });
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(400);
    });
});

app.post('/login', (req, res) => {
  const code = req.body.code;
  const spotifyApi = new SpotifyWebApi({
    redirectUri: redirectUri,
    clientId: clientId,
    clientSecret: clientSecret,
  });

  spotifyApi
    .authorizationCodeGrant(code)
    .then((data) => {
      res.json({
        accessToken: data.body.access_token,
        refreshToken: data.body.refresh_token,
        expiresIn: data.body.expires_in,
      });
    })
    .catch((err) => {
      console.log(err);
      res.sendStatus(400);
    });
});
const api = functions.https.onRequest(app);
export { api };
if (NODE_ENV == 'development')
  app.listen(5000, () => console.log('listening on port 5000'));
