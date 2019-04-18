const fs = require('fs');
const path = require('path');
const webpackSpritesmith = require('webpack-spritesmith');
const handlebars = require('handlebars');

const getFolders = (dir) => {
	return fs.readdirSync(dir).filter((file) => {
		return fs.statSync(path.join(dir, file)).isDirectory()
	})
}

const spriteConfig = {
	ratio: '',
	imageSource: '',
	imageDest: '',
	spriteScssDest: '',
	pngFolders: '',
	spriteMapsTemplate: 'config/sprites/handlebars/sprite_maps_template.hbs',
	spriteTemplate: 'config/sprites/handlebars/sprite_template.hbs'
}

// 스프라이트 맵 생성
const makeSpriteMap = (type) => {
	const template = handlebars.compile(fs.readFileSync(`${spriteConfig.spriteMapsTemplate}`).toString());
	const spriteMap = template({
		prefix: 'sp_',
		path: path.relative(spriteConfig.spriteScssDest, path.join(`${spriteConfig.spriteScssDest}/${type}`)).replace(/\\/g, '/'),
		import: spriteConfig.pngFolders
	})

	if (!fs.existsSync(spriteConfig.spriteScssDest)) {
		fs.mkdirSync(spriteConfig.spriteScssDest)
	}

	fs.writeFileSync(path.join(`${spriteConfig.spriteScssDest}`, `_sprite_${type}_maps.scss`), spriteMap, 'utf8')
}

// png 스프라이트 파일 생성
const makePngSprite = (folder) => {
	return new webpackSpritesmith({
		src: {
			cwd: `${spriteConfig.imageSource}/png/${folder}`,
			glob: '*.png'
		},
		target: {
			image: `${spriteConfig.imageDest}/png/sp_${folder}.png`,
			css: [
				[
					`${spriteConfig.spriteScssDest}/png/_sp_${folder}.scss`,
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
			'handlebars': `${spriteConfig.spriteTemplate}`
		},
		apiOptions: {
			cssImageRef: `${spriteConfig.imageDest}/png/sp_${folder}.png`,
			handlebarsHelpers: {
				ratio: spriteConfig.ratio
			}
		}
	})
}

const setSpriteConfig = (device, imageSourcePath, imageDestPath, spriteScssDestPath) => {
	spriteConfig.ratio = device === 'pc' ? 1 : 2;
	spriteConfig.imageSource = imageSourcePath || 'src/assets/img/sprites';
	spriteConfig.imageDest = imageDestPath || 'public/img/sprites';
	spriteConfig.spriteScssDest = spriteScssDestPath || 'src/assets/scss/sprites';

	if (!fs.existsSync(`${spriteConfig.imageSource}/png`)) {
		throw new Error('Not found image source directory');
	} else {
		spriteConfig.pngFolders = getFolders(`${spriteConfig.imageSource}/png`);
	}
}

const pngSprite = (device, imageSourcePath, imageDestPath, spriteScssDestPath) => {
	setSpriteConfig(device, imageSourcePath, imageDestPath, spriteScssDestPath);

	if (!spriteConfig.pngFolders) return;

	makeSpriteMap('png');

	return spriteConfig.pngFolders.map((folder) => makePngSprite(folder));
}

module.exports = pngSprite;
