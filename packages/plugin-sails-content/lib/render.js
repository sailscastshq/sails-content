const fs = require('fs')
const path = require('path')
const matter = require('gray-matter')
const showdown = require('showdown')
const ejs = require('ejs')

function render(filePath, config) {
  const fileContent = fs.readFileSync(filePath, 'utf8')
  const { data, content } = matter(fileContent)

  const layout = data.layout || config.layout
  const layoutDir = path.dirname(layout)

  const converter = new showdown.Converter({ ghCompatibleHeaderId: true })
  const htmlContent = converter.makeHtml(content)

  // Partial function that mimics Sails.js partial() behavior
  const partial = (partialPath, locals = {}) => {
    const resolvedPath = path.resolve(layoutDir, partialPath)
    return ejs.render(
      fs.readFileSync(resolvedPath, 'utf8'),
      {
        ...config.locals,
        ...locals,
        data,
        content: htmlContent,
        partial
      },
      { filename: resolvedPath }
    )
  }

  const layoutContent = fs.readFileSync(layout, 'utf8')
  const renderedHtml = ejs.render(
    layoutContent,
    {
      ...config.locals,
      data,
      content: htmlContent,
      partial
    },
    { filename: layout }
  )

  return { data, renderedHtml }
}

module.exports = render
