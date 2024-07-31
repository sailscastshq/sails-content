const fs = require('fs').promises
const path = require('path')
const render = require('./render')
const writeHtmlToOutput = require('./write-html-to-output')

async function generateContent(config) {
  const files = await fs.readdir(config.inputDir)

  for (const file of files) {
    const filePath = path.join(config.inputDir, file)
    const fileStats = await fs.stat(filePath)

    if (fileStats.isDirectory()) {
      await generateContent({
        ...config,
        inputDir: filePath,
        outputDir: path.join(config.outputDir, file)
      })
    } else if (fileStats.isFile() && file.toLowerCase().endsWith('.md')) {
      const { renderedHtml } = await render(filePath, config)

      const outputFilePath = await writeHtmlToOutput(
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
