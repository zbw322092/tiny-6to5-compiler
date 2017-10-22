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
      { 
        test: /\.tsx?$/, 
        loader: 'awesome-typescript-loader',
        options: {
          configFileName: './src/tsconfig.json'
        }
      },
      { 
        test: /\.js$/, 
        loader: "source-map-loader",
        enforce: "pre"
      }
    ]
  }
};