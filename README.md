﻿<pre>
  _____           _         _    _       _                                    
 |  __ \         | |       | |  | |     | |                                   
 | |__) |_ _ _ __| |_ _   _| |__| |_   _| |__    ___  ___ _ ____   _____ _ __ 
 |  ___/ _` | '__| __| | | |  __  | | | | '_ \  / __|/ _ \ '__\ \ / / _ \ '__|
 | |  | (_| | |  | |_| |_| | |  | | |_| | |_) | \__ \  __/ |   \ V /  __/ |   
 |_|   \__,_|_|   \__|\__, |_|  |_|\__,_|_.__/  |___/\___|_|    \_/ \___|_|   
                       __/ |                                                  
                      |___/
</pre>
PartyHub server hosts the PartyHub-app as well as all the games.

## Usage

- Pull the repo to any location on your server.
- Copy the contents `.env.example` to a new `.env` file and modify them as
  needed
- Create a public folder and copy the built PartyHub-app into it
- Add all the games you want to host, by copying their output folders into a
  shared folder. (Usually `/games`)
- Start the server with `node index.js`
