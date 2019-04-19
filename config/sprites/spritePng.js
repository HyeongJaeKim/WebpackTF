const fs = require('fs');
const path = require('path');
const webpackSpritesmith = require('webpack-spritesmith');
const handlebars = require('handlebars');
const chokidar = require('chokidar');

const getFolders = (dir) => {
	return fs.readdirSync(dir).filter((file) => {
		return fs.statSync(path.join(dir, file)).isDirectory()
	})
}

const getFolders2 = (dir) => {
	console.log('123', dir);
	return new Promise((resolve, reject) => {
		resolve (fs.readdirSync(dir).filter((file) => {
			return fs.statSync(path.join(dir, file)).isDirectory()
		}))
		// return fs.readdirSync(dir).filter((file) => {
		// 	return fs.statSync(path.join(dir, file)).isDirectory()
		// })
	});
}

const isFiles = (dir) => {
	return !!fs.readdirSync(dir).length;
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

const makeSpriteMap2 = (type) => {
	return new Promise((resolve, reject) => {
		const template = handlebars.compile(fs.readFileSync(`${spriteConfig.spriteMapsTemplate}`).toString());
		const spriteMap = template({
			prefix: 'sp_',
			path: path.relative(spriteConfig.spriteScssDest, path.join(`${spriteConfig.spriteScssDest}/${type}`)).replace(/\\/g, '/'),
			import: spriteConfig.pngFolders
		})

		if (!fs.existsSync(spriteConfig.spriteScssDest)) {
			fs.mkdirSync(spriteConfig.spriteScssDest)
		}
		resolve (
			fs.writeFileSync(path.join(`${spriteConfig.spriteScssDest}`, `_sprite_${type}_maps.scss`), spriteMap, 'utf8')
		)
	});
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

async function watch () {
	const watcher = chokidar.watch('.', {cwd: `${spriteConfig.imageSource}/png`, persistent: true});
	const log = console.log.bind(console);
	// Add event listeners.
	watcher.on('ready', async () => {
		console.log(`watching... [${path.join(`${spriteConfig.imageSource}/png`)}]`);

		watcher.on('all', async (eventName, targetPath) => {
			console.log('path.basename(path.dirname(targetPath)) :', path.basename(path.dirname(targetPath)));
			console.log('eventName :', eventName, 'targetPath :', targetPath);
			console.log(getFolders(`${spriteConfig.imageSource}/png`));
			if (eventName === 'addDir') {
				spriteConfig.pngFolders = await getFolders2(`${spriteConfig.imageSource}/png`);
				console.log(spriteConfig.pngFolders);

				console.log('1', spriteConfig.pngFolders);
				console.log('addDir');
				await makeSpriteMap2('png');

				// spriteConfig.pngFolders.map((folder) => makePngSprite(folder));
			}
		});
	});
	// watcher
	// 	.on('addDir', path => log(`Directory ${path} has been added`))
	// 	.on('change', path => log(`File ${path} has been changed`))
	// 	.on('unlink', path => log(`File ${path} has been removed`));
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
	console.log('119', isFiles(`${spriteConfig.imageSource}/png/test4`));
	makeSpriteMap('png');
	watch();
	return spriteConfig.pngFolders.map((folder) => makePngSprite(folder));
}

module.exports = pngSprite;
