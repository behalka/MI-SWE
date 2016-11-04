'use strict'

const Promise = require('bluebird')
const fs = Promise.promisifyAll(require('fs'))
const json2csv = require('json2csv')
const csv2json = require('csvtojson')
const route = './datasets/'

const create = Promise.coroutine(function * (json, fields, name) {
  try {
    const csv = json2csv({ data: json, fields })
    yield fs.writeFileAsync(`${route}${name}.csv`, csv)
  }
  catch(e) {
    console.error(`CSV file write failed ${e.message}`)
  }
})

function parsedToPromise(converter) {
  return new Promise((resolve, reject) => {
    converter.once('end_parsed', (json) => resolve(json))
  })
}

const get = Promise.coroutine(function *(filename) {
  const converter = new csv2json.Converter({})
  fs.createReadStream(`${route}${filename}.csv`).pipe(converter)
  const json = yield parsedToPromise(converter)
  return json
})

module.exports = {
  create,
  get
}
