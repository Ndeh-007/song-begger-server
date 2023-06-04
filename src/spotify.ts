import axios from "axios"
import { randomUUID } from "crypto"
import fs from "fs"

var TOKEN_DIR = (process.env.HOME || process.env.HOMEPATH ||
    process.env.USERPROFILE) + '/.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'spotify_access_token.json';

interface ISong {
    title: string,
    artist: string,
    image: string,
    id: string,
    date: number
}

function saveDataToSystem(data: any) {
    try {
        fs.mkdirSync(TOKEN_DIR);
    } catch (err) {
        if (err.code != 'EEXIST') {
            throw err;
        }
    }
    fs.writeFile(TOKEN_PATH, JSON.stringify(data), (err) => {
        if (err) throw err;
        console.log('Token stored to ' + TOKEN_PATH);
    });
}

function readAccessToken():Promise<any> {
    return new Promise((resolve, reject) => {
        // Check if we have previously stored a token.
        fs.readFile(TOKEN_PATH, async function (err, token) {
            if (err) {
                let token_data = await requestAccessToken();
                resolve(token_data)
            } else {
                let token_data = JSON.parse(token as any);
                resolve(token_data)
            }
        });
    })
}

async function requestAccessToken() {
    let url = "https://accounts.spotify.com/api/token"
    let res = await axios.post(url, {
        client_id: "d16860988beb42ccaabc4b1c3709c15a",
        client_secret: "d66c2867fe754ebd8870f2e8bc31b42f",
        grant_type: "client_credentials"
    }, {
        headers: {
            "Content-Type": "application/x-www-form-urlencoded"
        }
    })
    saveDataToSystem(res.data)
    return res.data
}

export async function searchWithSpotify(value: string) { 
    return new Promise(async (resolve, reject)=>{ 
        value = encodeURIComponent(value)
        let access_data = await readAccessToken()
        console.log(value)
        let url = `https://api.spotify.com/v1/search?q=${value}&type=track`
        axios.get(url, {
            headers: {
                Authorization: `Bearer ${access_data.access_token}`
            }
        }).then(async (res)=>{
            let tracks = res.data.tracks.items
            let songs: ISong[] = []
            for (let track of tracks) {
                let artists = track.artists.map((a) => {
                    return a.name
                })
                let s: ISong = {
                    title: track.name,
                    artist: artists.toLocaleString().replaceAll(",", ", "),
                    id: randomUUID(),
                    image: track.album.images[0].url,
                    date: Date.now()
                }
                songs.push(s)
            }
            resolve(songs)

        }).catch(async (e)=>{
            console.log("Error occcured. Requesting new access token")
            console.log(e)
            await requestAccessToken() 
            resolve([])
            reject(e)
        })
    })

}
