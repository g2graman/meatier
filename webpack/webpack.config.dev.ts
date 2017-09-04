import * as path from 'path';
import * as webpack from 'webpack';
import {getDotenv} from '../src/universal/utils/dotenv';
import * as HappyPack from 'happypack';
import * as ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';


// Import .env and expand variables:
getDotenv();

const root = process.cwd();
const srcDir = path.resolve(root, 'src');
const clientInclude = [
    path.join(srcDir, 'client'),
    path.join(srcDir, 'universal')
];
const globalCSS = path.join(srcDir, 'universal', 'styles', 'global');


const prefetches = [
  'react-dnd/lib/index.js',
  'joi/lib/index.js',
  'universal/modules/kanban/containers/Kanban/KanbanContainer.js'
];

const prefetchPlugins = prefetches.map(specifier => new webpack.PrefetchPlugin(specifier));


let config: webpack.Configuration = {
  // devtool: 'source-map',
  /*
   When changing developer tool for debugging,
   be sure to clear happypack cache (rm -r .happypack/) to clear out old source-maps
  */
  devtool: 'eval',
  context: srcDir,
  entry: {
    app: [
      'react-hot-loader',
      'client/client.js',
      'webpack-hot-middleware/client'
    ]
  },
  output: {
    filename: '[name].[hash].js',
    chunkFilename: '[name]_[chunkhash].js',
    path: path.join(root, 'build'),
    publicPath: '/static/'
  },
  plugins: [
    ...prefetchPlugins,

    new ForkTsCheckerWebpackPlugin({ checkSyntacticErrors: true }),

    new webpack.optimize.CommonsChunkPlugin({
        name: 'runtime'
    }),

    new webpack.HotModuleReplacementPlugin({multiStep: true}),

    new webpack.DefinePlugin({
      '__CLIENT__': true,
      '__PRODUCTION__': false,
      'process.env.NODE_ENV': JSON.stringify('development')
    }),
    new webpack.EnvironmentPlugin([
      'PROTOCOL',
      'HOST',
      'PORT'
    ]),
    new HappyPack({
      id: 'ts',
      loaders: [`ts-loader?${JSON.stringify({ happyPackMode: true })}`],
      threads: 4,
      verbose: true
    })
  ],
  resolve: {
    extensions: [
        '.tsx',
        '.ts',
        '.js',
        '.jsx',
        '.css'
    ],
    modules: [
        srcDir,
        'node_modules'
    ]
  },
  // used for joi validation on client
  node: {
    dns: 'mock',
    net: 'mock'
  },
  module: {
    rules: [
      {test: /\.json$/, use: 'json-loader'},
      {test: /\.txt$/, use: 'raw-loader'},
      {test: /\.(png|jp(e)?g|gif|svg|woff(2)?)$/, use: 'url-loader?limit=10000'},
      {test: /\.(eot|ttf|wav|mp3)$/, use: 'file-loader'},
      {
          test: /\.css$/,
          use: [{
              loader: 'css-loader',
              options: {
                  url: false,
                  modules: true,
                  // sourceMap: true,
                  importLoaders: 1,
                  localIdentName: '[name]_[local]_[hash:base64:8]',
              },
          }, {
              loader: 'postcss-loader',
              options: {
                  plugins: [
                      require('postcss-icss-values')
                  ]
              },
          }],

          include: clientInclude,
          exclude: globalCSS
      },
      {
          test: /\.css$/,
          use: [
              'style-loader', { // https://medium.com/@sapegin/css-modules-with-typescript-and-webpack-6b221ebe5f10
                  loader: 'typings-for-css-modules-loader',
                  options: {
                      modules: true,
                      namedExport: true,
                      camelCase: true
                  }
              }
          ],
          include: globalCSS
      },
      {
          test: /\.[jt]s(x)?$/,
          use: [
              'happypack/loader?id=ts'
          ], include: clientInclude
      }
    ]
  }
};

export default config;
