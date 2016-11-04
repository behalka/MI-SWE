'use strict'

const Promise = require('bluebird')

// helper object to keep game names
let games

const steam = require('./scraper/steam')
const metascore = require('./scraper/metascore')
const twitch = require('./scraper/twitch')

steam.loadTopPlayedGames(false)
.then((result) => {
  games = result
  return Promise.all([twitch.loadStreams(games), metascore.loadReviews(games)]) 
})
.catch((err) => {
  console.log(err)
})
.finally(() => {
  console.log('done')
})