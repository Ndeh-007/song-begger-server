import axios from "axios";
import fs from "fs"
import { google } from "googleapis";
var readline = require("readline")
var OAuth2 = google.auth.OAuth2;

export const key = "AIzaSyB56Pk4jkneU0rwShgZp6T0ItyWgPX_0CM"

// If modifying these scopes, delete your previously saved credentials
// at ~/.credentials/youtube-nodejs-quickstart.json
var SCOPES = ['https://www.googleapis.com/auth/youtube.readonly'];
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
export var TOKEN_PATH = TOKEN_DIR + 'youtube-nodejs-quickstart.json';



/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, ) {
  var clientSecret = credentials.web.client_secret;
  var clientId = credentials.web.client_id;
  var redirectUrl = credentials.web.redirect_uris[0];
  var oauth2Client = new OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      getNewToken(oauth2Client);
    } else {
      oauth2Client.credentials = JSON.parse(token as any);
    }
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token); 
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
    if (err) throw err;
    console.log('Token stored to ' + TOKEN_PATH);
  });
}
   
export function initializeYouTubeAPI(){
// Load client secrets from a local file.
fs.readFile('./src/client_secret.json', function processClientSecrets(err, content) {
    if (err) {
      console.log('Error loading client secret file: ' + err);
      return;
    }
    // Authorize a client with the loaded credentials, then call the YouTube API.
    authorize(JSON.parse(content as any));
  });
}
 
function getAccessToken(){
    fs.readFile(TOKEN_PATH, (error, token)=>{
        if (error){
            throw Error("No access token at specified path")
        }else{
            let data = JSON.parse(token as any)
            let access_token = data.access_token
            return access_token
        }
    }) 
}

export async function searchYouTube(value:string){
    let access_token = "ya29.a0AWY7Ckn0R8o_xZrTLGQStxOBsLNAhZc5uSRACwW27YYxQHw46zI-H_pMXEcXs_YVuPqXey2nqL_tk4_QwTisASlu84Z8xuRQYe7B07cKMCfCMj2iCXu0lD1No1MtGZt3tHuexMl3N4h_Y9F7LKkmy8473JKkaCgYKAXkSARASFQG1tDrpo0VXOOMRvKAhPD62ZYWFUQ0163"
    value = encodeURIComponent(value)
    let url = `https://youtube.googleapis.com/youtube/v3/search?part=snippet&type=video&key=${key}&q=${value}`
    let ytRes = await axios.get(url, {
        headers:{
            Accept:"application/json",
            Authorization:`Bearer ${access_token}`
        }
    })
    console.log(ytRes)
    
    return ytRes.data
}