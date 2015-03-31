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
