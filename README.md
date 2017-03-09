# Anione
An NPM modules to ease the repetitiveness that comes with coding HTML5 banner ads.

# Generated Project Structure
* ani-conf.json
* README.md
* assets
	* failovers
		* (project-size.jpg)
		* (project-size.png)
		...
	* images
		* (layer-size.jpg)
		* (layer-size.png)
		...
	* libs-js
		* (js-library.js)
		...
	* libs-css
		* (css-library.css)
		...
* banners
	* (size)
		* (size.html)
		* (size.scss)
		* (size.js)
	...
* templates
	* banner.lodash (used as a base for banners, can be customized before generating first banner)
	* dev.lodash (A template that is used for the development webpage. Links to all banners will be displayed here for quick access.)
	* preview.lodash (This template is used to generate the drag n' drop preview, which nicely displays all banners to be reviewed.)