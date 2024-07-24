const generateContent = require('./generate-content')
module.exports = function pluginSailsContent(sails) {
  return {
    name: 'sails:content',
    setup(api) {
      api.onDevCompileDone(async function () {
        await generateContent(sails)
      })
      api.onAfterBuild(async function () {
        await generateContent(sails)
      })
    }
  }
}
