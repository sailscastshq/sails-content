const assert = require('node:assert/strict')
const fs = require('fs')
const os = require('os')
const path = require('path')
const test = require('node:test')

const render = require('../lib/render')

function renderMarkdown(markdown) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sails-content-render-'))
  const layoutPath = path.join(tempDir, 'layout.ejs')
  const markdownPath = path.join(tempDir, 'post.md')

  fs.writeFileSync(layoutPath, '<main><%- content %></main>')
  fs.writeFileSync(
    markdownPath,
    ['---', `layout: ${layoutPath}`, '---', '', markdown].join('\n')
  )

  return render(markdownPath, {
    layout: layoutPath,
    locals: {}
  }).renderedHtml
}

test('render supports the conservative markdown preset', () => {
  const renderedHtml = renderMarkdown(
    [
      '| Item | Amount |',
      '| --- | --- |',
      '| Your design fee | N500,000 |',
      '',
      'This was ~~old~~ but the docs now say visit https://example.com.',
      '',
      'Keep foo_bar_baz literal.',
      '',
      '\\<div>escaped example\\</div>'
    ].join('\n')
  )

  assert.match(renderedHtml, /<table>/)
  assert.match(renderedHtml, /<del>old<\/del>/)
  assert.match(
    renderedHtml,
    /<a href="https:\/\/example\.com">https:\/\/example\.com<\/a>\./
  )
  assert.match(renderedHtml, /foo_bar_baz/)
  assert.doesNotMatch(renderedHtml, /foo<em>bar<\/em>baz/)
  assert.match(renderedHtml, /&lt;div&gt;escaped example&lt;\/div&gt;/)
})

test('render preserves fenced code blocks', () => {
  const renderedHtml = renderMarkdown(
    ['```js', 'console.log(1)', '```'].join('\n')
  )

  assert.match(
    renderedHtml,
    /<pre><code class="js language-js">console\.log\(1\)/
  )
})
