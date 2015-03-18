console.log("Running ti-commonjs-wrap-plugin...");

exports.cliVersion = '>=3.X';

String.prototype.endsWith = function (s) {
  return this.length >= s.length && this.substr(this.length - s.length) == s;
}

exports.init = function (logger, config, cli, appc) {
    cli.on("build.post.compile", function (build, finished) {
		var wrench = require('wrench'),
			fs = require('fs'),
			path = require('path');

		var appDir = build.xcodeAppDir;
		logger.info('Search js files to wrap in ' + appDir);
		var files = wrench.readdirSyncRecursive(appDir);
		var platform = cli.argv.platform;

		files.forEach(function(file) {
			var fullpath = path.join(appDir, file);
			if (!/ti\-commonjs\.js$/.test(file) && /\.js$/.test(file)) {
				var stats = fs.lstatSync(fullpath);
				if (stats.isFile() || (stats.isSymbolicLink() && fs.lstatSync(fs.readlinkSync(fullpath)).isFile())) {
					logger.debug('Wrapping ' + file + '...');
					wrapFile(file, fullpath, platform);
				}
			}
		});

		finished();
	});
};

function wrapFile(file, fullpath, platform) {
	var fs = require('fs'),
		path = require('path');

	var filename = '/' + file,
		wrapperBase = '(function(tirequire,__dirname,__filename){',
		content = fs.readFileSync(fullpath, 'utf8'),
		code = wrapperBase;

	// make sure it isn't already wrapped
	if (content.indexOf(wrapperBase) === 0) {
		return;
	}

	// app.js has no module in Titanium. Create it.
	if (file.endsWith('app.js')) {
		code += 'var module={exports:{}};';
		code += 'var exports = module.exports;';
		code += '__mainModule=module;';
		code += 'module.id=".";';
	} else {
		code += 'module.id=__filename;';
	}

	code += 'module.loaded=false;';
	code += 'module.filename=__filename;';
	code += 'var require=tirequire("node_modules/ti-commonjs/lib/ti-commonjs")(__dirname,module);';

	if (platform === 'android') {
		// doesn't support overriding module.require
		// https://github.com/tonylukasavage/ti-commonjs/issues/19
	} else {
		code += 'module.require=require;';
	}

	// This is a hack to fix alloy-based requires. Rather than changing the format of the path
	// to comply with ti-commonjs.js, I simple have it continue to use the Titanium require()
	// via tirequire(). This should eventually be handled in Alloy itself.
	code += content.replace(/require\((['"])alloy/g, 'tirequire($1alloy');

	code += '\nmodule.loaded=true;})(require,"' + path.dirname(filename) + '","' + filename + '");';
	fs.unlinkSync(fullpath);
	fs.writeFileSync(fullpath, code);
}