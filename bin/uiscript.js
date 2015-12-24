#!/usr/bin/env node

let argv = require('minimist')(process.argv.slice(2));
let glob = require("glob")

// TODO: create globs and options

require('../src/runner.js')(glob, options);
