const fs = require('fs')
const path = require('path')
const render = require('./render')
const writeHtmlToOutput = require('./write-html-to-output')

function generateContent(config) {
  const files = fs.readdirSync(config.inputDir)

  for (const file of files) {
    const filePath = path.join(config.inputDir, file)
    const fileStats = fs.statSync(filePath)

    if (fileStats.isDirectory()) {
      generateContent({
        ...config,
        inputDir: filePath,
        outputDir: path.join(config.outputDir, file)
      })
    } else if (fileStats.isFile() && file.toLowerCase().endsWith('.md')) {
      const { renderedHtml } = render(filePath, config)

      const outputFilePath = writeHtmlToOutput(
        renderedHtml,
        file,
        config.inputDir
      )

      sails.log.verbose(
        `[sails:content] Processed ${filePath} -> ${outputFilePath}`
      )
    }
  }
}

module.exports = generateContent
