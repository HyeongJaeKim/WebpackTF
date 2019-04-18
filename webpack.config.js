const path = require('path');
const pngSprite = require('./config/sprites/spritePng');

module.exports = {
	mode: 'development',
	entry: [
		path.resolve(path.join(__dirname, './src/'), 'index.js')
	],
	output: {
		filename: 'bundle.js',
		path: path.resolve(__dirname, './public'),
		publicPath: '/public/',
	},
	devServer: {
		port: 3000,
		hot: true
	},
	module: {
		rules: [
			{
				test: /\.css$/,
				use: [
					'style-loader',
					'css-loader'
				]
			},
			{
				test: /\.scss$/,
				use: [
					'style-loader',
					'css-loader',
					'sass-loader'
				]
			},
			{
				test: /\.png$/,
				use: [
					'file-loader?name=img/[name].[ext]'
				]
			}
		]
	},
	plugins: [
		...pngSprite('pc', 'src/assets/img/sprites', 'public/img/sprites', 'src/assets/scss/sprites')
	]
}
