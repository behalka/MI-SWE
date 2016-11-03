'use strict'

// helper object to keep game names
let games

const steam = require('./scraper/steam')
steam.loadTopPlayedGames(false)
.then((result) => {
  games = result
})
.finally(() => {
  console.log('done')
})