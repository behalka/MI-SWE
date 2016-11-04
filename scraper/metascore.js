'use strict'

const _ = require('lodash')
const Promise = require('bluebird')
const request = require('request-promise')
const cheerio = require('cheerio')

const sources = require('./sources')
const csv = require('./csvHelper')

const fs = Promise.promisifyAll(require('fs'))

function wait(max) {
  return new Promise((resolve, reject) => {
    const time = Math.random() * (max - 500) + 500
    setTimeout(() => resolve(), time);
  })
}

function scrapeDetailUrl(response) {
  return new Promise((resolve, reject) => {
    // console.log(response)
    const $ = cheerio.load(response.body)
    const url = $('.first_result').find('.product_title').first().children('a').first().attr('href')
    console.log(url)
    return resolve(url)
  })
}

function scrapeDetail(game, response, results, detailUrl) {
  return new Promise((resolve, reject) => {
    const $ = cheerio.load(response.body)
    const result = {}
    result.uri = `${sources.METASCORE}${detailUrl}`
    result.name = game.name
    // basic info
    result.score = parseInt($('.summary_wrap').first().find('.metascore_wrap span[itemprop="ratingValue"]').text(), 10)
    result.summary = $('.summary_wrap').find('.product_summary').first().find('span.data').text().trim()
    result.score_based_on = parseInt($('.summary_wrap').find('.metascore_wrap span[itemprop="reviewCount"]').first().text(), 10)
    // reviews
    result.top_review_source = $('.critic_reviews').find('.first_review .review_critic .source').text().trim()
    result.top_review_date = $('.critic_reviews').find('.first_review .review_critic .date').text().trim()
    result.top_review_source_uri = $('.critic_reviews').find('.first_review .review_critic .source').find('a').first().attr('href')
    result.top_review_grade = parseInt($('.critic_reviews').find('.first_review .review_grade').text(), 10)
    result.top_review_text = $('.critic_reviews').find('.first_review .review_body').text().trim()
    results.push(result)
    resolve()
  })
}

const loadReviews = Promise.coroutine(function * (games) {
  const results = []
  for (let i = 0; i < games.length; i++) {
    const url = `${sources.METASCORE}/search/game/${encodeURI((games[i].name).toLowerCase())}/results`
    let res = yield request.get(url, Object.assign(sources.defaultOptions, { headers: sources.defaultHeaders }))
    const detailUrl = yield scrapeDetailUrl(res)
    yield wait(1500)

    try {
      if(typeof(detailUrl) === 'undefined') {
        throw new Error(`game ${games[i].name} detail was not scraped`)
      }
      res = yield request.get(`${sources.METASCORE}${detailUrl}`, Object.assign(sources.defaultOptions, { headers: sources.defaultHeaders }))
      yield scrapeDetail(games[i], res, results, detailUrl)
    }
    catch(e) {
      console.log(e.message)
    }
    yield wait(1500)
  }

  // let res = yield fs.readFileAsync('./pom.html')

  const fields = _.keys(results[0])
  csv.create(results, fields, 'metascore')
})

module.exports = {
  loadReviews
}