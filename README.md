# ti-commonjs-wrap-plugin

The module [ti-commonjs](https://github.com/tonylukasavage/ti-commonjs) allows to use NodeJS style modules in Alloy. This plugin for the Titanium CLI adds support for stock Titanium SDK code.

## How to install

Check out the module and place it at

```
plugins/ti-commonjs-wrap-plugin
```

inside of your Titanium project.

Install the required npm packages:

```bash
$ cd plugins/ti-commonjs-wrap-plugin
$ npm install
```

Add the plugin to your `tiapp.xml`:

```xml
<plugins>
    <plugin version="1.0">ti-commonjs-wrap-plugin</plugin>
</plugins>
```

## How to control what to wrap

The plugin supports a [.gitignore](http://git-scm.com/docs/gitignore) like file named `.commonjswrapignore` in the project root directory. Files matching the patterns in this file are not wrapped, i.e. the `require` command in those files is the original Titanium `require`.

## How to control where the ti-commonjs module is found

By default the wrapper code will try to `tirequire` the module 
`node_modules/ti-commonjs/lib/ti-commonjs`. If the `ti-commonjs` npm module is installed somewhere else than in the project root, the `ti_commonjs_dir` variable must be set in `app.js`, i.e. globally.

By default `ti_commonjs_dir` is set to `node_modules`. If for example `ti-commonjs` is installed into `node_world/node_modules/ti-commonjs`, the following is necessary **before** any wrapped file is required:

```javascript
ti_commonjs_dir = "node_world/node_modules";
var my_first_node_module = require("node_world/node_app.js");
```

Like in the upper example this mechanism can be used together with `.commonjswrapignore` to restrict the wrapping to a "node world" directory. Outside of that directory no wrapping takes place.

The corresponding `.commonjswrapignore` file looks like this:

```
*
!Resources/node_world
```

## How to build the example

```bash
$ cd example
$ cd Resources
$ npm install
$ cd ..
$ ti build -p ios
...
[DEBUG] Application booted in 123.372018 ms
  mocha
    + works

  1 passing (6ms)
```
