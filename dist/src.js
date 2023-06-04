var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key2 of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key2) && key2 !== except)
        __defProp(to, key2, { get: () => from[key2], enumerable: !(desc = __getOwnPropDesc(from, key2)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/youtube.ts
var import_axios = __toESM(require("axios"));
var import_fs = __toESM(require("fs"));
var import_googleapis = require("googleapis");
var readline = require("readline");
var OAuth2 = import_googleapis.google.auth.OAuth2;
var key = "AIzaSyB56Pk4jkneU0rwShgZp6T0ItyWgPX_0CM";
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) + "/.credentials/";
var TOKEN_PATH = TOKEN_DIR + "youtube-nodejs-quickstart.json";
async function searchYouTube(value) {
  let access_token = "ya29.a0AWY7Ckn0R8o_xZrTLGQStxOBsLNAhZc5uSRACwW27YYxQHw46zI-H_pMXEcXs_YVuPqXey2nqL_tk4_QwTisASlu84Z8xuRQYe7B07cKMCfCMj2iCXu0lD1No1MtGZt3tHuexMl3N4h_Y9F7LKkmy8473JKkaCgYKAXkSARASFQG1tDrpo0VXOOMRvKAhPD62ZYWFUQ0163";
  value = encodeURIComponent(value);
  let url = `https://youtube.googleapis.com/youtube/v3/search?part=snippet&type=video&key=${key}&q=${value}`;
  let ytRes = await import_axios.default.get(url, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${access_token}`
    }
  });
  console.log(ytRes);
  return ytRes.data;
}

// src/spotify.ts
var import_axios2 = __toESM(require("axios"));
var import_crypto = require("crypto");
var import_fs2 = __toESM(require("fs"));
var TOKEN_DIR2 = (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) + "/.credentials/";
var TOKEN_PATH2 = TOKEN_DIR2 + "spotify_access_token.json";
function saveDataToSystem(data) {
  try {
    import_fs2.default.mkdirSync(TOKEN_DIR2);
  } catch (err) {
    if (err.code != "EEXIST") {
      throw err;
    }
  }
  import_fs2.default.writeFile(TOKEN_PATH2, JSON.stringify(data), (err) => {
    if (err)
      throw err;
    console.log("Token stored to " + TOKEN_PATH2);
  });
}
function readAccessToken() {
  return new Promise((resolve, reject) => {
    import_fs2.default.readFile(TOKEN_PATH2, async function(err, token) {
      if (err) {
        let token_data = await requestAccessToken();
        resolve(token_data);
      } else {
        let token_data = JSON.parse(token);
        resolve(token_data);
      }
    });
  });
}
async function requestAccessToken() {
  let url = "https://accounts.spotify.com/api/token";
  let res = await import_axios2.default.post(url, {
    client_id: "d16860988beb42ccaabc4b1c3709c15a",
    client_secret: "d66c2867fe754ebd8870f2e8bc31b42f",
    grant_type: "client_credentials"
  }, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    }
  });
  saveDataToSystem(res.data);
  return res.data;
}
async function searchWithSpotify(value) {
  return new Promise(async (resolve, reject) => {
    value = encodeURIComponent(value);
    let access_data = await readAccessToken();
    console.log(value);
    let url = `https://api.spotify.com/v1/search?q=${value}&type=track`;
    import_axios2.default.get(url, {
      headers: {
        Authorization: `Bearer ${access_data.access_token}`
      }
    }).then(async (res) => {
      let tracks = res.data.tracks.items;
      let songs = [];
      for (let track of tracks) {
        let artists = track.artists.map((a) => {
          return a.name;
        });
        let s = {
          title: track.name,
          artist: artists.toLocaleString(),
          id: (0, import_crypto.randomUUID)(),
          image: track.album.images[0].url
        };
        songs.push(s);
      }
      resolve(songs);
    }).catch(async (e) => {
      console.log("Error occcured. Requesting new access token");
      console.log(e);
      await requestAccessToken();
      reject(e);
    });
  });
}

// src/index.ts
var express = require("express");
var firebase = require("firebase");
var cors = require("cors");
var bodyParser = require("body-parser");
var multer = require("multer");
var upload = multer();
require("firebase/firestore");
var firebaseConfig = {
  apiKey: "AIzaSyCyGJpuGlrzMjV0kIaMht4673xiKN9gEgs",
  authDomain: "beggar-dc861.firebaseapp.com",
  projectId: "beggar-dc861",
  storageBucket: "beggar-dc861.appspot.com",
  messagingSenderId: "146917155340",
  databaseURL: "https://beggar-dc861-default-rtdb.firebaseio.com",
  appId: "1:146917155340:web:8db9ca5043d55b666c0429",
  measurementId: "G-G8ZZQQH572"
};
var f_app = firebase.initializeApp(firebaseConfig);
var database = firebase.database(f_app);
var firestore = firebase.firestore(f_app);
async function processSongRequest(req) {
  if (req.body.api == "youtube") {
    let res = await searchYouTube(req.body.keywords);
    return res;
  }
  if (req.body.api == "spotify") {
    let res = await searchWithSpotify(req.body.keywords);
    return res;
  }
}
var app = express();
var port = 3001;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(upload.array());
app.use(cors());
app.get("/", (req, res) => {
  res.send("Song Beggar");
});
app.post("/", (req, res) => {
  if (req.body.keywords == "") {
    res.send(false);
  }
  processSongRequest(req).then((results) => {
    res.send(results);
  }).catch((error) => {
    res.send(error);
  });
});
app.listen(port, () => {
  console.log(`Song Beggar Server, Listening on ${port}`);
});
//# sourceMappingURL=src.js.map
