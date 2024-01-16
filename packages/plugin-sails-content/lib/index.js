const generateContent = require('./generate-content')
module.exports = function pluginSailsContent(config) {
  return {
    name: 'sails:content',
    setup(api) {
      api.onDevCompileDone(async function () {
        await generateContent(config)
      })
      api.onAfterBuild(async function () {
        await generateContent(config)
      })
    }
  }
}
