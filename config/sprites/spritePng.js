const path = require('path');
const webpackSpritesmith = require('webpack-spritesmith');
const handlebars = require('handlebars');
const { spriteConfig, makeSpriteMap} = require('./spriteCommon');

const makeSprite = (folder) => {
	return new webpackSpritesmith({
		src: {
			cwd: path.resolve(__dirname, `../../${spriteConfig.imageSource}/png/${folder}`),
			glob: '*.png'
		},
		target: {
			image: `${spriteConfig.imageDest}/png/sp_${folder}.png`,
			css: [
				[
					path.resolve(__dirname, `../../${spriteConfig.spriteScssDest}/png/_sp_${folder}.scss`),
					{
						spritesheetName: `sp_${folder}`,
						format: 'handlebars'
					}
				]
			]
		},
		spritesmithOptions: {
			padding: 2
		},
		customTemplates: {
			'handlebars': path.resolve(__dirname, `../../${spriteConfig.spriteTemplate}`)
		},
		apiOptions: {
			cssImageRef: path.join('http://localhost', 'RND/webpackTF', `${spriteConfig.imageDest}/png/sp_${folder}.png`),
			handlebarsHelpers: {
				ratio: spriteConfig.ratio
			}
		}
	})
}

const runSprite = () => {
	if (!spriteConfig.pngFolders) return;

	makeSpriteMap('png');

	return spriteConfig.pngFolders.map((folder) => makeSprite(folder));
}

module.exports = runSprite();
