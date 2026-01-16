const fs = require('fs/promises')
const path = require('path')
const matter = require('gray-matter')
const showdown = require('showdown')
const ejs = require('ejs')

async function render(filePath, config) {
  const fileContent = await fs.readFile(filePath, { encoding: 'utf8' })
  const { data, content } = matter(fileContent)

  const layout = data.layout || config.layout
  const layoutDir = path.dirname(layout)

  const converter = new showdown.Converter({ ghCompatibleHeaderId: true })
  const htmlContent = converter.makeHtml(content)

  // Create a partial function that mimics Sails.js partial() behavior
  const partial = (partialPath, locals = {}) => {
    const resolvedPath = path.resolve(layoutDir, partialPath)
    const partialContent = require('fs').readFileSync(resolvedPath, 'utf8')
    return ejs.render(
      partialContent,
      {
        ...config.locals,
        ...locals,
        data,
        content: htmlContent,
        partial
      },
      {
        filename: resolvedPath
      }
    )
  }

  const layoutContent = await fs.readFile(layout, { encoding: 'utf8' })
  const renderedHtml = ejs.render(
    layoutContent,
    {
      ...config.locals,
      data,
      content: htmlContent,
      partial
    },
    {
      filename: layout
    }
  )

  return { data, renderedHtml }
}

module.exports = render
