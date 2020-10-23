const path = require("path");

module.exports = {
  entry: "./app/index.js",
  watch: true,
  target: "electron-renderer",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
  },
  resolve: {
    alias: {
    },
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        use: {
          loader: "babel-loader",
        },
      },
      {
        test: /\.styl$/,
        use: [
          "css-loader",
          {
            loader: "stylus-loader",
            options: {
              import: [path.resolve(__dirname, "src/public/css/var.styl")],
            },
          },
        ],
      },
      {
        test: /\.css$/,
        use: ["css-loader"],
      },
    ],
  },
  optimization: {
    splitChunks: false,
  }
};
