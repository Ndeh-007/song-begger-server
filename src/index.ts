import { request } from "express";
import axios from "axios"; 
import { initializeYouTubeAPI, searchYouTube } from "./youtube";
import { searchWithSpotify } from "./spotify";

const express = require("express")
const firebase = require("firebase");
var cors = require('cors')
const bodyParser = require("body-parser")
const multer = require("multer")
let upload = multer()
require("firebase/firestore");

const firebaseConfig = {
    apiKey: "AIzaSyCyGJpuGlrzMjV0kIaMht4673xiKN9gEgs",
    authDomain: "beggar-dc861.firebaseapp.com",
    projectId: "beggar-dc861",
    storageBucket: "beggar-dc861.appspot.com",
    messagingSenderId: "146917155340",
    databaseURL: "https://beggar-dc861-default-rtdb.firebaseio.com",
    appId: "1:146917155340:web:8db9ca5043d55b666c0429",
    measurementId: "G-G8ZZQQH572"
};

const f_app = firebase.initializeApp(firebaseConfig)
 
async function processSongRequest(req) {
    // if (req.body.api == 'youtube'){
    //     let res = await searchYouTube(req.body.keywords)
    //     return res
    // }
    // if (req.body.api == 'spotify'){
    //     let res = await searchWithSpotify(req.body.keywords)
    //     return res
    // }

    let res = await searchWithSpotify(req.body.keywords)
    return res
}


const app = express()
const port = 3001

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(upload.array());
app.use(cors())

app.get("/", (req, res) => {
    res.send("Song Beggar") 
}) 

app.post('/', (req, res) => {

    if (req.body.keywords == "") {
        res.send(false)
    }

    processSongRequest(req).then((results) => {
        res.send(results)
    }).catch((error) => {
        res.send(error)
    })
})


app.listen(port, () => {
    console.log(`Song Beggar Server, Listening on ${port}`)
})

// authorize the api
// initializeYouTubeAPI()