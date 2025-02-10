# Auction System

A real-time auction system with admin and house client interfaces.

## Structure

- /server - Backend server (Node.js, Express, Socket.IO)
- /clients - Frontend clients (HTML, CSS, JavaScript)
- /database - Database migrations and seeds
- /docs - Project documentation
- both clients are also present in sub repository (Yes! I have Made the Sub Folder of Clients also 
  into an online repository to host them on github pages)

## Setup

1. Clone the repository
2. Install dependencies (`npm install` in server directory)
3. Copy .env.example to .env and configure
4. Initialize database
5. Start the server
6. If you are running the server on local machine then
    1. setup a tunnel (free service like cloudflared or ngrok will work fine)
    2. Start the Tunnel. this will give you a generated URL.
    3. paste that URL on the both clients client/(house||admin)/src/js/config.js on the API_URL.
    4. Rerun the the webpage if using on local machine or redeploy the webpage to update the URLs. 

## Development

```bash
npm run dev
```

## Production

```bash
npm run build
npm start
```

## Creator's Note

This was initial version of the Auctioning system that was just made in under 2 days by a newbie webdeveloper. You can expect a more refined, responsive version of this soon in another repository. This website was used on Lnmiit's Vivacity 25 at "The Movie Auction" hosted by Quizzinga the LNMIIT quiz club. The Website Supported Live Auction Upadates and Facilitation of 100s of people attending and observing the auction. I hope the idea of this goes far and only becomes better in future.


## Creator's Note 2

You the Viewer may have noticed that This System is still very unrefined, several security issues, design flaws, page not looking good enough, not having option for a item to go unsold, not having option to revert a sale in case there is a problem with the sale, participants not seeing the item getting sold almost live( dynamic bid increase ) and a tons of features missing(maybe) or you can see more potential in this... Thats Why I am making this Repository *Open Source*. I would be Honered and Glad if you want to contribute to this system in any way. My emails are open for communication. 

## Links

House Client Repository: https://github.com/Axe-08/movie-auction-house
Admin Client Repository: https://github.com/Axe-08/Movie-Auction-Admin
CloudFlared I used for Tunnel: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/
