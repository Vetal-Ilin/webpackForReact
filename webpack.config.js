"use strict";

const path = require("path"); 
const HTMLWebpackPlugin = require("html-webpack-plugin"); // модуль для работы сжатия HTML файла
const { CleanWebpackPlugin } = require("clean-webpack-plugin"); // модуль для очистки выходной директории
const CopyWebpackPlugin = require("copy-webpack-plugin"); // модуль копирования статических файлов
const MiniCssExtractPlugin = require("mini-css-extract-plugin"); // выноска css в отдельный выходной файл
const OptimizeCssAssetWebpackPlugin = require("optimize-css-assets-webpack-plugin"); // плагин для минификации и оптимизации css 
const TerserWebpackPlugin = require("terser-webpack-plugin"); // плагин для минификации css  
const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer"); // в режиме продакшена выводит в браузере анализ библиотек которые подключены


const isDev = process.env.NODE_ENV === "development";
const isProd = !isDev;

const optimization = () => {
  const config = {
    splitChunks: {
      chunks: "all",
    },
  };

  if (isProd) {
    config.minimizer = [
      new OptimizeCssAssetWebpackPlugin(),
      new TerserWebpackPlugin(),
    ];
  }

  return config;
};

const devtool = () => {
  if (isDev) {
    return "source-map";
  }
};

const jsLoaders = () => {
  const loaders = [
    {
      loader: "babel-loader",
      options: {
        presets: ["@babel/preset-env"],
        plugins: ["@babel/plugin-proposal-class-properties"],
      },
    },
  ];


  return loaders; 
};

const plugins = () => {
  const base = [
    new HTMLWebpackPlugin({
      template: "./index.html",
      minify: {
        collapseWhitespace: isProd,
      },
    }),
    new CleanWebpackPlugin(),
    
    new MiniCssExtractPlugin({
      filename: filename("css"),
    }),
  ];

  if (isProd) {
    base.push(new BundleAnalyzerPlugin());
  }

  return base;
};

const filename = (ext) => (isDev ? `[name].${ext}` : `[name].[hash].${ext}`);

module.exports = {
  context: path.resolve(__dirname, "src"),
  mode: "development",
  entry: {
    app: ["@babel/polyfill", "./index.jsx"] 
  },
  output: {
    filename: filename("js"),
    path: path.resolve(__dirname, "dist"),
  },
  resolve: {
    extensions: [".jsx", ".js", ".json", ".png"],
    alias: {
      "@images": path.resolve(__dirname, "src/assets/images"),
      "@assets": path.resolve(__dirname, "src/assets"),
      "@components": path.resolve(__dirname, "src/components"),
      "@jsx": path.resolve(__dirname, "src/jsx"),
      "@": path.resolve(__dirname, "src"),
    },
  },
  optimization: optimization(),
  devServer: {
    open: true,
    historyApiFallback: true

  },
  devtool: devtool(),
  plugins: plugins(),
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
          },
          "css-loader",
        ],
      },
      {
        test: /\.less$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader, 
          },
          "css-loader",
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                config: path.resolve(__dirname, 'postcss.config.js')
              }
            }
          },
          "less-loader",
        ],
      },
      {
        test: /\.(png|jpg|svg|gif)$/,
        use: [
          {
            loader: "url-loader",
            options: {
              limit: 8192,
            },
          },
          {
            loader: 'image-webpack-loader',
            options: {
              mozjpeg: {
                progressive: true,
              },
              optipng: {
                enabled: false,
              },
              pngquant: {
                quality: [0.65, 0.90],
                speed: 4
              },
              gifsicle: {
                interlaced: false
              },
            },
          },
        ],
      },
      {
        test: /\.(ttf|woff|woff2|eot)$/,
        use: [
          "file-loader",
        ],       
      },
      {
        test: /\.(mp4|ogv|webm)$/, //удалить
        use: {
          loader: 'url?limit=10000&mimetype=video/mp4',
        }
      },
      {
        test: /\.xml$/,
        use: ["xml-loader"],
      },
      {
        test: /\.csv$/,
        use: ["csv-loader"],
      },
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: jsLoaders(),
      },
      {
        test: /\.jsx$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-react"],
          }
        }
      },
    ],
  },
};
