const generateContent = require('./generate-content')
module.exports = function pluginSailsContent(options) {
  return {
    name: 'sails:content',
    setup(api) {
      api.onDevCompileDone(async function () {
        await generateContent(options.inputDir)
      })
      api.onAfterBuild(async function () {
        await generateContent(options.inputDir)
      })
    }
  }
}
