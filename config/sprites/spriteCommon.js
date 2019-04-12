const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');

const getFolders = (dir) => {
	return fs.readdirSync(dir).filter((file) => {
		return fs.statSync(path.join(dir, file)).isDirectory()
	})
}

const spriteConfig = {
	ratio: process.env.DEVICE_ENV === 'pc' ? 1 : 2,
	imageSource: 'src/img/sprites',
	imageDest: 'src/img',
	mapScssDest: 'src/scss/import',
	spriteScssDest: 'src/scss/sprites',
	spriteMapsTemplate: 'config/sprites/handlebars/sprite_maps_template.hbs',
	spriteTemplate: 'config/sprites/handlebars/sprite_template.hbs'
}
spriteConfig.pngFolders = getFolders(`${spriteConfig.imageSource}/png`);

const makeSpriteMap = (type) => {
	const template = handlebars.compile(fs.readFileSync(`${spriteConfig.spriteMapsTemplate}`).toString());
	const spriteMap = template({
		prefix: 'sp_',
		path: path.relative(spriteConfig.mapScssDest, path.join(`${spriteConfig.spriteScssDest}/${type}`)).replace(/\\/g, '/'),
		import: spriteConfig.pngFolders
	})

	if (!fs.existsSync(spriteConfig.mapScssDest)) {
		fs.mkdirSync(spriteConfig.mapScssDest)
	}

	fs.writeFileSync(path.join(`${spriteConfig.mapScssDest}`, '_sprite_png_maps.scss'), spriteMap, 'utf8')
}

module.exports = {
	spriteConfig: spriteConfig,
	makeSpriteMap: makeSpriteMap
}
