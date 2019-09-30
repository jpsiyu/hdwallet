const path = require('path')

module.exports = {
  pluginOptions: {
    autoRouting: {
      chunkNamePrefix: 'page-'
    }
  },
  chainWebpack: (config) => {
    config.resolve.alias
      .set('~', path.resolve(__dirname, 'src'))
      .set('@', path.resolve(__dirname, 'src'))
  }
}
