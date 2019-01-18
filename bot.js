const tmi = require('tmi.js');

// Define configuration options
const opts = {
  identity: {
    username: process.env.BOT_USERNAME,
    password: process.env.OAUTH_TOKEN
  },
  channels: [
    process.env.CHANNEL_NAME
  ]
};

var requestedSongs = [];

// Create a client with our options
const client = new tmi.client(opts);

// Register our event handlers (defined below)
client.on('message', onMessageHandler);
client.on('connected', onConnectedHandler);

// Connect to Twitch:
client.connect();

// Called every time a message comes in
function onMessageHandler (target, context, msg, self) {
  if (self) { return; } // Ignore messages from the bot

  // Remove whitespace from chat message
  const commandName = msg.trim();

  // If the command is known, let's execute it
  if (commandName === '!dice') {
    // feel free to remove
    const num = rollDice();
    client.say(target, `You rolled a ${num}`);
    console.log(`* Executed ${commandName} command`);
  } 
  //or change this to however you make song requests
  else if (msg.startsWith('!songs request')) {
    client
        .mods('nataroons')
        .then(function(data) {
            if(data.includes(target.slice(1))){
                var song = msg.replace('!songs request', "").trim();
                if(!requestedSongs.includes(song)){
                    requestedSongs.push(song);
                    client.say(target, `Thanks for the request`);
                } else {
                    client.say(target, `Already in playlist`);
                }
            }
            else {
                client.say(target, `Sorry, you must be a mod to request songs`);
            }
        })
        .catch(function(err) {
            console.log(err);
        });
  } 
  else if (commandName === '!songsRequested') {
    var allsongs = "";
    if(requestedSongs.length == 0){
        client.say(target, `Songs list is empty`);
    } else {
        for (let i = 0; i < requestedSongs.length; i++) {
            allsongs += requestedSongs[i] + "\n"
        }
        client.say(target, `All songs: ${allsongs}`);
    }
    console.log(`* Executed ${commandName} command`);
  } 
  else if (commandName === '!clearPlaylist') {
    client
        .mods('nataroons')
        .then(function(data) {
            if(data.includes(target.slice(1))){
                requestedSongs = [];
                client.say(target, `Playlist cleared`);
            }
            else {
                client.say(target, `Sorry, you must be a mod to clear the playlist`);
            }
        })
        .catch(function(err) {
            console.log(err);
        });
  } 
  else {
    console.log(`* Unknown command ${commandName}`);
  }
}

// Function called when the "dice" command is issued
function rollDice () {
  const sides = 6;
  return Math.floor(Math.random() * sides) + 1;
}

// Called every time the bot connects to Twitch chat
function onConnectedHandler (addr, port) {
  console.log(`* Connected to ${addr}:${port}`);
}
