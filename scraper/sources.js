'use strict'
const rp = require('request-promise')
// SOURCES
const urls = {
  steam: 'http://store.steampowered.com/stats/', //done
  reviews: 'http://www.metacritic.com',
  channels: 'http://twitch.tv'
}

module.exports = {
  STEAM: 'http://store.steampowered.com/stats/',
  METASCORE: 'http://www.metacritic.com',
  defaultHeaders: {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/54.0.2840.71 Safari/537.36'
  },
  defaultOptions: {
    jar: true,
    followAllRedirects: true,
    resolveWithFullResponse: true
  }
}