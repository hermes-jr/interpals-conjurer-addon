#!/bin/sh
zip -r -Z deflate -FS ./conjurer.xpi icons/*.png manifest.json *.js *.css README.md LICENSE
