const fs = require('fs').promises
const path = require('path')
const matter = require('gray-matter')
module.exports = (function sailsContent() {
  const datastores = {}

  const adapter = {
    // The identity of this adapter, to be referenced by datastore configurations in a Sails app.
    identity: 'sails-content',

    // Waterline Adapter API Version
    adapterApiVersion: 1,

    datastores: datastores,

    defaults: {
      schema: true,

      dir: 'content'
    },
    registerDatastore: function registerDatastore(datastoreConfig, models, cb) {
      const identity = datastoreConfig.identity

      if (datastores[identity]) {
        throw new Error('Datastore `' + identity + '` is already registered.')
      }

      const datastore = {
        migrate: 'safe',
        config: datastoreConfig
      }
      datastores[identity] = datastore
      return cb()
    },
    find: async function find(datastoreName, query, cb) {
      const datastore = datastores[datastoreName]
      const contentDir = path.join(datastore.config.dir, query.using)
      const files = await fs.readdir(contentDir)
      let records = []
      let id = 1
      for (const file of files) {
        const content = await fs.readFile(path.join(contentDir, file), {
          encoding: 'utf8'
        })
        const { data: record, content: mdContent } = matter(content)
        record.id = id++
        record.slug = path.parse(file).name
        record.content = mdContent
        records.push({ ...record })
      }

      records = records.map((item) =>
        query.criteria.select.reduce((acc, key) => {
          if (item.hasOwnProperty(key) && !query.criteria.omit?.includes(key)) {
            acc[key] = item[key]
          }
          return acc
        }, {})
      )

      return cb(undefined, records)
    },
    findOne: async function find(datastoreName, query, cb) {
      const datastore = datastores[datastoreName]
      const contentDir = path.join(datastore.config.dir, query.using)
      const content = await fs.readFile(
        path.join(contentDir, query.slug || query),
        {
          encoding: 'utf8'
        }
      )
      const id = 1
      let { data: record, content: mdContent } = matter(content)
      record.id = id
      record.slug = path.parse(content).name
      record.content = mdContent
      record = query.criteria.select.reduce((acc, key) => {
        if (record.hasOwnProperty(key) && !query.criteria.omit?.includes(key)) {
          acc[key] = record[key]
        }
        return acc
      }, {})
      return cb(undefined, record)
    },
    count: async function count(datastoreName, query, cb) {
      const datastore = datastores[datastoreName]
      const contentDir = path.join(datastore.config.dir, query.using)
      const files = await fs.readdir(contentDir)
      let records = []
      let id = 1
      for (const file of files) {
        const content = await fs.readFile(path.join(contentDir, file), {
          encoding: 'utf8'
        })
        const { data: record, content: mdContent } = matter(content)
        record.id = id++
        record.slug = path.parse(file).name
        record.content = mdContent
        records.push({ ...record })
      }

      records = records.filter((item) => {
        for (const key in query.criteria.where) {
          if (item[key] !== query.criteria.where[key]) {
            return false
          }
        }
        return true
      })

      return cb(undefined, records.length)
    },
    define: function define(datastoreName, tableName, definition, cb) {
      return cb()
    },
    drop: function drop(datastoreName, tableName, relations, cb) {
      return cb()
    }
  }
  return adapter
})()
