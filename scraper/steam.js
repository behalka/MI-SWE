'use strict'

const _ = require('lodash')
const Promise = require('bluebird')
const request = require('request-promise')
const cheerio = require('cheerio')

const sources = require('./sources')
const csv = require('./csvHelper')

function scrapeTopPlayedGames(response, result) {
  return new Promise((resolve, reject) => {
    const $ = cheerio.load(response)
    $('#detailStats').find('tr.player_count_row').each(function(i, elem) {
      const row = $(elem).find('td')
      const game = {}
      game.active_players = $(row).first().children('span').first().text()
      game.name = $(row).last().children('a').first().text()
      game.steam_uri = $(row).last().children('a').attr('href')
      result.push(game)
    })
    return resolve()
  })
}

// todo: download additional data from stream store - the link is extracted

const loadTopPlayedGames = Promise.coroutine(function * (doScrape) {
  if(!doScrape) {
    return csv.get('steam')
  }
  const res = yield request.get(sources.STEAM)
  const result = []
  yield scrapeTopPlayedGames(res, result)

  // transform to csv and store
  const fields = _.keys(result[0])
  csv.create(result, fields, 'steam')

  return result
})

module.exports = {
  loadTopPlayedGames
}