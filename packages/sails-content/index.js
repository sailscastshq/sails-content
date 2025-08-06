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
      let files
      try {
        files = await fs.readdir(contentDir)
      } catch (error) {
        if (error.code === 'ENOENT') {
          // Directory doesn't exist, return empty results
          return cb(undefined, [])
        }
        throw error
      }
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

      records = records.map((item) => {
        // If no select criteria, return the entire item (minus omit fields)
        if (!query.criteria || !query.criteria.select) {
          if (query.criteria && query.criteria.omit) {
            const filteredItem = { ...item }
            query.criteria.omit.forEach((key) => {
              delete filteredItem[key]
            })
            return filteredItem
          }
          return item
        }

        // Apply select criteria
        return query.criteria.select.reduce((acc, key) => {
          if (item.hasOwnProperty(key) && !query.criteria.omit?.includes(key)) {
            acc[key] = item[key]
          }
          return acc
        }, {})
      })

      return cb(undefined, records)
    },
    findOne: async function find(datastoreName, query, cb) {
      const datastore = datastores[datastoreName]
      const contentDir = path.join(datastore.config.dir, query.using)
      let content
      try {
        content = await fs.readFile(
          path.join(contentDir, query.slug || query),
          {
            encoding: 'utf8'
          }
        )
      } catch (error) {
        if (error.code === 'ENOENT') {
          // File or directory doesn't exist, return undefined
          return cb(undefined, undefined)
        }
        throw error
      }
      const id = 1
      let { data: record, content: mdContent } = matter(content)
      record.id = id
      record.slug = path.parse(content).name
      record.content = mdContent
      // If no select criteria, return the entire record (minus omit fields)
      if (!query.criteria || !query.criteria.select) {
        if (query.criteria && query.criteria.omit) {
          const filteredRecord = { ...record }
          query.criteria.omit.forEach((key) => {
            delete filteredRecord[key]
          })
          record = filteredRecord
        }
        // Otherwise return the full record as-is
      } else {
        // Apply select criteria
        record = query.criteria.select.reduce((acc, key) => {
          if (
            record.hasOwnProperty(key) &&
            !query.criteria.omit?.includes(key)
          ) {
            acc[key] = record[key]
          }
          return acc
        }, {})
      }
      return cb(undefined, record)
    },
    count: async function count(datastoreName, query, cb) {
      const datastore = datastores[datastoreName]
      const contentDir = path.join(datastore.config.dir, query.using)
      let files
      try {
        files = await fs.readdir(contentDir)
      } catch (error) {
        if (error.code === 'ENOENT') {
          // Directory doesn't exist, return 0 count
          return cb(undefined, 0)
        }
        throw error
      }
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
    create: function create(datastoreName, query, cb) {
      // No-op: sails-content is primarily a read-only adapter
      // Only return data if fetch is enabled
      if (query.meta && query.meta.fetch) {
        return cb(undefined, {})
      }
      return cb()
    },
    createEach: function createEach(datastoreName, query, cb) {
      // No-op: sails-content is primarily a read-only adapter
      // Only return data if fetch is enabled
      if (query.meta && query.meta.fetch) {
        return cb(undefined, [])
      }
      return cb()
    },
    update: function update(datastoreName, query, cb) {
      // No-op: sails-content is primarily a read-only adapter
      // Only return data if fetch is enabled
      if (query.meta && query.meta.fetch) {
        return cb(undefined, [])
      }
      return cb()
    },
    destroy: function destroy(datastoreName, query, cb) {
      // No-op: sails-content is primarily a read-only adapter
      // Only return data if fetch is enabled
      if (query.meta && query.meta.fetch) {
        return cb(undefined, [])
      }
      return cb()
    },
    setSequence: function setSequence(datastoreName, tableName, sequence, cb) {
      // No-op: sails-content doesn't support auto-increment sequences
      // Content files use file-based identifiers, not numeric sequences
      return cb()
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
