var T=Object.create;var g=Object.defineProperty;var q=Object.getOwnPropertyDescriptor;var E=Object.getOwnPropertyNames;var A=Object.getPrototypeOf,P=Object.prototype.hasOwnProperty;var x=(e,t,r,o)=>{if(t&&typeof t=="object"||typeof t=="function")for(let a of E(t))!P.call(e,a)&&a!==r&&g(e,a,{get:()=>t[a],enumerable:!(o=q(t,a))||o.enumerable});return e};var u=(e,t,r)=>(r=e!=null?T(A(e)):{},x(t||!e||!e.__esModule?g(r,"default",{value:e,enumerable:!0}):r,e));var p=u(require("axios")),m=require("crypto"),i=u(require("fs")),f=(process.env.HOME||process.env.HOMEPATH||process.env.USERPROFILE)+"/.credentials/",d=f+"spotify_access_token.json";function O(e){try{i.default.mkdirSync(f)}catch(t){if(t.code!="EEXIST")throw t}i.default.writeFile(d,JSON.stringify(e),t=>{if(t)throw t;console.log("Token stored to "+d)})}function R(){return new Promise((e,t)=>{i.default.readFile(d,async function(r,o){if(r){let a=await y();e(a)}else{let a=JSON.parse(o);e(a)}})})}async function y(){let e="https://accounts.spotify.com/api/token",t=await p.default.post(e,{client_id:"d16860988beb42ccaabc4b1c3709c15a",client_secret:"d66c2867fe754ebd8870f2e8bc31b42f",grant_type:"client_credentials"},{headers:{"Content-Type":"application/x-www-form-urlencoded"}});return O(t.data),t.data}async function b(e){return new Promise(async(t,r)=>{e=encodeURIComponent(e);let o=await R();console.log(e);let a=`https://api.spotify.com/v1/search?q=${e}&type=track`;p.default.get(a,{headers:{Authorization:`Bearer ${o.access_token}`}}).then(async n=>{let w=n.data.tracks.items,l=[];for(let c of w){let S=c.artists.map(_=>_.name),I={title:c.name,artist:S.toLocaleString().replaceAll(",",", "),id:(0,m.randomUUID)(),image:c.album.images[0].url,date:Date.now()};l.push(I)}t(l)}).catch(async n=>{console.log("Error occcured. Requesting new access token"),console.log(n),await y(),t([]),r(n)})})}var j=require("express"),z=require("firebase"),D=require("cors"),k=require("body-parser"),H=require("multer"),N=H();require("firebase/firestore");var U={apiKey:"AIzaSyCyGJpuGlrzMjV0kIaMht4673xiKN9gEgs",authDomain:"beggar-dc861.firebaseapp.com",projectId:"beggar-dc861",storageBucket:"beggar-dc861.appspot.com",messagingSenderId:"146917155340",databaseURL:"https://beggar-dc861-default-rtdb.firebaseio.com",appId:"1:146917155340:web:8db9ca5043d55b666c0429",measurementId:"G-G8ZZQQH572"},K=z.initializeApp(U);async function v(e){return await b(e.body.keywords)}var s=j(),h=3001;s.use(k.urlencoded({extended:!1}));s.use(k.json());s.use(N.array());s.use(D());s.get("/",(e,t)=>{t.send("Song Beggar")});s.post("/",(e,t)=>{e.body.keywords==""&&t.send(!1),v(e).then(r=>{t.send(r)}).catch(r=>{t.send(r)})});s.listen(h,()=>{console.log(`Song Beggar Server, Listening on ${h}`)});