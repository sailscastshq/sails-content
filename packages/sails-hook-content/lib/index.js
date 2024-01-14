/**
 * sails-content hook
 *
 * @description :: A hook definition.  Extends Sails by adding shadow routes, implicit actions, and/or initialization logic.
 * @docs        :: https://sailsjs.com/docs/concepts/extending-sails/hooks
 */
const pluginSailsContent = require('plugin-sails-content')
module.exports = function defineSailsContentHook(sails) {
  return {
    defaults: {
      content: {
        inputDir: 'content', // Default content directory
        output: 'static' // creates the .html files for all your .md files in content at build time.
      }
    },
    /**
     * Runs when this Sails app loads/lifts.
     */
    initialize: async function () {
      sails.log.info('Initializing custom hook (`sails-content`)')
      if (sails.config.content.output == 'static') {
        sails.config.shipwright.build.plugins.push(
          pluginSailsContent({ inputDir: sails.config.content.inputDir })
        )
      }
    }
  }
}
