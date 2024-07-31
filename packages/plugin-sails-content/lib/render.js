const fs = require('fs/promises')
const matter = require('gray-matter')
const showdown = require('showdown')
const ejs = require('ejs')

async function render(filePath, config) {
  const fileContent = await fs.readFile(filePath, { encoding: 'utf8' })
  const { data, content } = matter(fileContent)

  const layout = data.layout || config.layout

  const converter = new showdown.Converter({ ghCompatibleHeaderId: true })
  const htmlContent = converter.makeHtml(content)

  const layoutContent = await fs.readFile(layout, { encoding: 'utf8' })
  const renderedHtml = ejs.render(layoutContent, {
    ...config.locals,
    data,
    content: htmlContent
  })

  return { data, renderedHtml }
}

module.exports = render
