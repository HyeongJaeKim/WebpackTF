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
	ratio: 1,
	// imageSource: 'src/assets/img/sprites',
	// imageDest: 'src/img',
	// spriteScssDest: 'src/assets/scss/sprites',
	spriteMapsTemplate: 'config/sprites/handlebars/sprite_maps_template.hbs',
	spriteTemplate: 'config/sprites/handlebars/sprite_template.hbs'
}
// spriteConfig.pngFolders = getFolders(`${spriteConfig.imageSource}/png`);

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

const setConfig = (device, imageSourcePath, imageDestPath, spriteScssDestPath) => {
	spriteConfig.ratio = device === 'pc' ? 1 : 2;
	spriteConfig.imageSource = imageSourcePath || 'src/assets/img/sprites';
	spriteConfig.imageDest = imageDestPath || 'src/img';
	spriteConfig.spriteScssDest = spriteScssDestPath || 'src/assets/scss/sprites';
	spriteConfig.pngFolders = getFolders(`${spriteConfig.imageSource}/png`);
}

const runPngSprite = (device, imageSourcePath, imageDestPath, spriteScssDestPath) => {
	setConfig(device, imageSourcePath, imageDestPath, spriteScssDestPath);

	console.log(spriteConfig.ratio);
	console.log(device, imageSourcePath, imageDestPath, spriteScssDestPath);

	if (!spriteConfig.pngFolders) return;

	makeSpriteMap('png');

	return spriteConfig.pngFolders.map((folder) => makePngSprite(folder));
}

module.exports = runPngSprite;
