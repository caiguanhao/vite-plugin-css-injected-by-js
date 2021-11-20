exports.__esModule = true
exports.default = function cssInjectedByJsPlugin () {
  return {
    apply: 'build',
    enforce: 'post',
    name: 'css-in-js-plugin',
    generateBundle (opts, bundle) {
      let styleCode = ''
      for (const key in bundle) {
        if (bundle[key]) {
          const chunk = bundle[key]
          if (chunk.type === 'asset' && chunk.fileName.includes('.css')) {
            styleCode += chunk.source
            delete bundle[key]
          }
        }
      }
      for (const key in bundle) {
        if (bundle[key]) {
          const chunk = bundle[key]
          if (chunk.type === 'chunk' && chunk.fileName.includes('.js')) {
            chunk.code += `;(function () { try { var style = document.createElement('style'); style.innerText = `
            chunk.code += JSON.stringify(styleCode)
            chunk.code += `; document.head.appendChild(style); } catch(e) { `
            chunk.code += `console.error(e, 'vite-plugin-css-injected-by-js: failed to add the style.'); } })();`
            break
          }
        }
      }
    },
    transformIndexHtml: {
      enforce: 'post',
      transform (html, ctx) {
        if (!ctx || !ctx.bundle) return html
        for (const [ , value ] of Object.entries(ctx.bundle)) {
          if (value.fileName.endsWith('.css')) {
            const reCSS = new RegExp(`<link rel="stylesheet"[^>]*?href="/${value.fileName}"[^>]*?>`)
            html = html.replace(reCSS, '')
          }
        }
        return html
      },
    },
  }
}
