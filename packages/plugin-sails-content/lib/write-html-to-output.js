const fs = require('fs')
const path = require('path')

function writeHtmlToOutput(renderedHtml, mdFile, inputDir) {
  const outputDirName = path.basename(mdFile, path.extname(mdFile))
  const parentDirName = inputDir !== 'content' ? path.basename(inputDir) : ''
  const outputDirectory = parentDirName
    ? path.join('.tmp', 'public', parentDirName, outputDirName)
    : path.join('.tmp', 'public', outputDirName)

  fs.mkdirSync(outputDirectory, { recursive: true })

  const outputFilePath = path.join(outputDirectory, 'index.html')
  fs.writeFileSync(outputFilePath, renderedHtml, 'utf8')

  return outputFilePath
}

module.exports = writeHtmlToOutput
