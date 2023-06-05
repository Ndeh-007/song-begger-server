var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
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

// src/spotify.ts
var import_axios = __toESM(require("axios"));
var import_crypto = require("crypto");
var import_fs = __toESM(require("fs"));
var EmailJS = __toESM(require("@emailjs/browser"));
var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE) + "/.credentials/";
var TOKEN_PATH = TOKEN_DIR + "spotify_access_token.json";
function saveDataToSystem(data) {
  try {
    import_fs.default.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != "EEXIST") {
      throw err;
    }
  }
  import_fs.default.writeFile(TOKEN_PATH, JSON.stringify(data), (err) => {
    if (err)
      throw err;
    console.log("Token stored to " + TOKEN_PATH);
  });
}
function readAccessToken() {
  return new Promise((resolve, reject) => {
    import_fs.default.readFile(TOKEN_PATH, async function(err, token) {
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
  let res = await import_axios.default.post(url, {
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
    import_axios.default.get(url, {
      headers: {
        Authorization: `Bearer ${access_data.access_token}`
      }
    }).then(async (res) => {
      console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
      console.log(res);
      console.log("++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++");
      if (res.status === 401) {
        console.log("Access Token Expired");
        console.log("Requesting new access token");
        await requestAccessToken();
        resolve([]);
        return;
      }
      let tracks = res.data.tracks.items;
      let songs = [];
      for (let track of tracks) {
        let artists = track.artists.map((a) => {
          return a.name;
        });
        let s = {
          title: track.name,
          artist: artists.toLocaleString().replaceAll(",", ", "),
          id: (0, import_crypto.randomUUID)(),
          image: track.album.images[0].url,
          date: Date.now(),
          href: track.href,
          previewLink: track.preview_url,
          spotifyLink: track.uri
        };
        songs.push(s);
      }
      resolve(songs);
    }, (err) => {
    }).catch(async (e) => {
      if (e.status.toString() === "401") {
        console.log("Access Token Expired");
        console.log("Requesting new access token");
        await requestAccessToken();
        resolve([]);
        return;
      }
      if (e.status === "429") {
        console.log("The app has exceeded its rate limits.");
        EmailJS.send("song_begger_mail_service", "song_beggar_contact", {
          email: "songbeggar@server.com",
          username: "Song Beggar Server",
          message: e.toString()
        }).then((res) => {
          console.log("light", "Operation Successful, " + res.text);
        }, (error) => {
          console.log("danger", "Operation Failed \n " + error.text);
        }).catch((err) => {
          console.log("danger", "Operation Failed");
          console.log(err);
        });
        let errorSong = {
          title: "Error",
          artist: e.message,
          id: (0, import_crypto.randomUUID)(),
          image: "",
          date: Date.now(),
          href: "",
          previewLink: "",
          spotifyLink: ""
        };
        resolve([errorSong]);
        return;
      }
      console.log("An Error Occurred");
      console.log("Requesting new access token");
      await requestAccessToken();
      resolve([]);
      return;
    });
  });
}

// src/index.ts
var EmailJS2 = __toESM(require("@emailjs/browser"));
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
EmailJS2.init("xhgni5tAASWOcxiAS");
var f_app = firebase.initializeApp(firebaseConfig);
async function processSongRequest(req) {
  let res = await searchWithSpotify(req.body.keywords);
  return res;
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
