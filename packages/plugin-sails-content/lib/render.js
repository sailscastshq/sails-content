const fs = require('fs/promises')
const matter = require('gray-matter')
const showdown = require('showdown')

async function render(sails, mdFile, layout) {
  const fileContent = await fs.readFile(mdFile, { encoding: 'utf8' })
  const { data, content } = matter(fileContent)

  layout = layout || data.layout

  const converter = new showdown.Converter({ ghCompatibleHeaderId: true })
  const htmlContent = converter.makeHtml(content)

  const layoutContent = await fs.readFile(layout, { encoding: 'utf8' })

  const renderedHtml = await sails.renderView(layoutContent, {
    layout: false,
    data,
    content: htmlContent,
    ...sails.config.views.locals
  })

  return { data, renderedHtml }
}

module.exports = render
