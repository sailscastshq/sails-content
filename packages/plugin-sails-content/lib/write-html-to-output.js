const fs = require('fs/promises')
const path = require('path')

async function writeHtmlToOutput(renderedHtml, mdFile, inputDir) {
  const outputDirName = path.basename(mdFile, path.extname(mdFile))
  const parentDirName = inputDir !== 'content' ? path.basename(inputDir) : ''
  const outputDirectory = parentDirName
    ? path.join('.tmp', 'public', parentDirName, outputDirName)
    : path.join('.tmp', 'public', outputDirName)

  await fs.mkdir(outputDirectory, { recursive: true })

  const outputFilePath = path.join(outputDirectory, 'index.html')
  await fs.writeFile(outputFilePath, renderedHtml, 'utf-8')

  return outputFilePath
}

module.exports = writeHtmlToOutput
