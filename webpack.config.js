const path = require('path');
const runPngSprite = require('./config/sprites/spritePng');

module.exports = {
	entry: {
		test: path.resolve(__dirname, './src/js/index'),
	},
	output: {
		path: path.resolve(__dirname, './src/dist'),
		filename: '[name].js'
	},
	module: {
		rules: [
			{
				test: /\.scss$/,
				exclude: /node_modules/,
				use: [
					{
						loader: "style-loader"
					},
					{
						loader: "css-loader"
					},
					{
						loader: "sass-loader"
					}
				]
			},
			// {
			// 	test: /\.(png|jp(e*)g)$/,
			// 	loader: 'url-loader',
			// 	options: {
			// 		limit: 8000,
			// 		name: 'img/png/[name].[ext]'
			// 	}
			// }
		]
	},
	plugins: [...runPngSprite('pc', 'src/assets/img/sprites', 'src/img', 'src/assets/scss/sprites')]
}
