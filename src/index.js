import axios from 'axios';
import { FastAverageColor } from 'fast-average-color';

const log = console.log.bind(console);
const clientid = '27396f5c152d4bf2b82503891c30f266';
const clientsecret = '33631337010645be9231764cc947ac29';
const authorisation = 'Basic MjczOTZmNWMxNTJkNGJmMmI4MjUwMzg5MWMzMGYyNjY6MzM2MzEzMzcwMTA2NDViZTkyMzE3NjRjYzk0N2FjMjk=';
const redirecturi = 'http://localhost:5500/';
const scope = 'user-read-private user-read-email user-read-currently-playing user-read-playback-state';

let authobj = {};
let userauthobj = {};


// request access token
async function getToken (code) {

    let headersconfig = {
        headers: {
            'Authorization': `${authorisation}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    };

    let output = axios.post('https://accounts.spotify.com/api/token', `grant_type=authorization_code&code=${code}&redirect_uri=${redirecturi}`, headersconfig)
    .then(res => {
        return authobj = res.data;
    })
    .catch(err => {
        redir();
    });

    return output;
};


// get player
async function getPlayer () {

    let headersconfig = {
        headers: {
            'Authorization': `Bearer ${userauthobj.access_token}`
        }
    };

    let output = axios.get('https://api.spotify.com/v1/me/player', headersconfig)
    .then(res => {
        return authobj = res.data.item;
    });

    return output;
};


// redirect user on first sign in
function redir() {
    let queries = `client_id=${clientid}&response_type=code&redirect_uri=${redirecturi}&scope=${scope}`;
    location.href = `https://accounts.spotify.com/authorize?${queries}`;
};
document.getElementById('btn').addEventListener('click', () => {
    redir();
});

// get image avg color
function getAvgColor (url) {

    const fac = new FastAverageColor();

    fac.getColorAsync(url)
        .then(color => {
            document.body.style.backgroundColor = `${color.hex}`;
        })
        .catch(e => {
            console.error(e);
        });
};

// continuous
function checkForState () {

    setInterval(async () => {

        let item = await getPlayer();
        document.getElementById('songimage').src = `${item.album.images[0].url}`;
        document.getElementById('songname').innerHTML = `${item.name}`;
        document.getElementById('artistname').innerHTML = `${item.album.artists[0].name}`;
        getAvgColor(item.album.images[0].url);

    }, 3000);
};

// compare and store user creds
const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');
if (urlParams.size>0 && code) {
    userauthobj = await getToken(code);
    checkForState();
};

// listen for key press
document.addEventListener('keypress', (e) => {
    if (e.keyCode === 49) {
        redir();
    };
});