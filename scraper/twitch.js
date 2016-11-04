'use strict'

const _ = require('lodash')
const Promise = require('bluebird')
const request = require('request-promise')

const sources = require('./sources')
const csv = require('./csvHelper')

const clientid = process.env.TWITCH_ID || 'client_id'

function getOptions(game) {
  return Object.assign(
    sources.defaultOptions,
    {
      method: 'GET',
      uri: 'https://api.twitch.tv/kraken/search/streams',
      qs: {
        client_id: clientid,
        query: game.name,
        'limit': 3
      }
    })
}

const loadStreams = Promise.coroutine(function * (games) {
  const results = []
  for (let i = 0; i < games.length; i++) {
    const res = yield request(getOptions(games[i]))
    const data = JSON.parse(res.body)
    for(let stream of data.streams) {
      const result = {}
      result.gameName = games[i].name
      result.id = stream._id
      result.viewers = stream.viewers
      result.created_at = stream.created_at
      result.channel_uri = stream.channel.url
      result.channel_lang = stream.channel.language
      result.channel_status = stream.channel.status
      result.channel_views = stream.channel.views
      results.push(result)
    }
  }
  const fields = _.keys(results[0])
  yield csv.create(results, fields, 'twitch')
})

module.exports = {
  loadStreams
}