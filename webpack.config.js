module.exports = {
  entry: {
    tokenizer: './src/1-tokenizer.ts'
  },
  output: {
    filename: '[name].bundle.js',
    path: __dirname + '/dist'
  },
  devtool: 'source-map',
  resolve: {
    extensions: [".ts", ".js"]
  },
  module: {
    rules: [
      { test: /\.tsx?$/, loader: 'awesome-typescript-loader' },
      { test: /\.js$/, enforce: "pre", loader: "source-map-loader" }
    ]
  }
};