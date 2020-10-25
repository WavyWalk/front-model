const webpack = require('webpack');
const path = require('path');
const nodeExternals = require('webpack-node-externals')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

module.exports = {
	target: 'node',
	node: {
		__dirname: false,
		__filename: false,
	},
	devtool: "inline-source-map",
	module: {
		rules: [
			{
				test: /\.ts$/,
				use: [
					'ts-loader'
				]
			}
		]
	},
	externals: [nodeExternals()],
	entry: "./src/index.ts",

	output: {
		path: path.resolve(__dirname, 'dist'),
		filename: 'index.js',
		devtoolModuleFilenameTemplate: '[absolute-resource-path]',
	},

	mode: 'development',
	plugins: [
		new CleanWebpackPlugin(),	
	],

	watch: true,
	
	resolve: {
		extensions: ['.ts', '.js', '.json']
	}
};
