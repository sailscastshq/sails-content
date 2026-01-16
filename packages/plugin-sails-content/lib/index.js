const generateContent = require('./generate-content')
module.exports = function pluginSailsContent(config) {
  return {
    name: 'sails:content',
    setup(api) {
      const runGenerateContent = () => generateContent(config)

      api.onDevCompileDone(runGenerateContent)
      api.onAfterBuild(runGenerateContent)
    }
  }
}
