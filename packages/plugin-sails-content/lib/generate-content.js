const fs = require('fs').promises
const path = require('path')
const render = require('./render')
const writeHtmlToOutput = require('./write-html-to-output')

async function generateContent(inputDir, outputDir = '.tmp/public') {
  const files = await fs.readdir(inputDir)

  for (const file of files) {
    const filePath = path.join(inputDir, file)
    const fileStats = await fs.stat(filePath)

    if (fileStats.isDirectory()) {
      await generateContent(filePath, path.join(outputDir, file))
    } else if (fileStats.isFile() && file.toLowerCase().endsWith('.md')) {
      const { data, renderedHtml } = await render(filePath)
      const outputFilePath = await writeHtmlToOutput(
        renderedHtml,
        file,
        inputDir
      )
      sails.log.verbose(
        `[sails:content] Processed ${filePath} -> ${outputFilePath}`
      )
    }
  }
}

module.exports = generateContent
