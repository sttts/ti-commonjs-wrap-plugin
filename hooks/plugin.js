console.log("Running ti-commonjs-wrap-plugin...");

exports.cliVersion = '>=3.X';

String.prototype.endsWith = function (s) {
  return this.length >= s.length && this.substr(this.length - s.length) == s;
}

String.prototype.beginsWith = function (s) {
  return this.substr(0, s.length) == s;
}

String.prototype.withoutPrefix = function (s) {
  return this.substr(s.length);
}

var projectDir = null;

exports.init = function (logger, config, cli, appc) {
	var fs = require('fs'),
		path = require('path'),
		ignore = require('ignore');
	var commonjs_wrap_ignore_passing = ignore().addIgnoreFile(
		ignore.select([
			'.commonjswrapignore'
		])
	).createFilter();

	var files_to_wrap = [];

	cli.on("build.pre.compile", function (build, finished) {
		projectDir = build.projectDir;
		finished();
	});

	cli.on("build.ios.copyResource", {
		pre: function (build, finished) {
			var source_file = build.args[0];
			var relative_source_file = source_file.withoutPrefix(projectDir + '/');

			process.nextTick(function() {
				if (!/ti\-commonjs\.js$/.test(source_file) && /\.js$/.test(source_file) &&
						relative_source_file.beginsWith('Resources/') &&
						commonjs_wrap_ignore_passing(source_file)) {
					files_to_wrap.push(relative_source_file.withoutPrefix('Resources/'));
				}

				if (/\.commonjswrapignore$/.test(source_file)) {
					// skip the .commonjswrapignore files
					build.fn = null;
					finished(null, build);
				} else {
					finished();
				}
			});
		}
	});

	cli.on("build.post.compile", function (build, finished) {
		var appDir = build.xcodeAppDir;
		var platform = cli.argv.platform;

		files_to_wrap.forEach(function(file) {
			var fullpath = path.join(appDir, file);
			try {
				var stats = fs.lstatSync(fullpath);
				if (stats.isFile() || (stats.isSymbolicLink() && fs.lstatSync(fs.readlinkSync(fullpath)).isFile())) {
					logger.debug('Wrapping ' + file + '...');
					wrapFile(file, fullpath, platform);
				}
			}
			catch (e) {
				// ignore
			}
		});

		finished();
	});
};

function wrapFile(file, fullpath, platform) {
	var fs = require('fs'),
		path = require('path');

	var filename = '/' + file,
		wrapperBase = '(function(tirequire,__dirname,__filename,__ticommon_dir){',
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
	code += 'var require=tirequire(__ticommon_dir+"/ti-commonjs/lib/ti-commonjs")(__dirname,module);';

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

	code += '\nmodule.loaded=true;})(require,"' + path.dirname(filename) + '","' + filename + '",(typeof(ti_commonjs_dir)=="undefined")?"node_modules":ti_commonjs_dir);';
	fs.unlinkSync(fullpath);
	fs.writeFileSync(fullpath, code);
}