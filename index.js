#!/usr/bin/env node --harmony
"use strict";

const program = require("commander");
const co = require("co");
const prompt = require("co-prompt");

program
	.version("1.1.1")
	.command("init", "Builds Anione project directory structure and config.")
	.command("one", "Generates first banner from template.")
	.command("resize", "Resize your first banner into all remaining sizes selected during configuration. These can also be found in your ani-conf.json file.")
	.command("watch", "Run a BrowserSync server to watch the banners and launch the generated index.html")
	.command("preview", "Generate a drag n' drop preview webpage to showcase the banners.")
	.command("stage", "Via rsync, copy preview to a stage server to showcase the banners.")
	.command("handoff", "Zip/Package/Compress the Banner-Ads for ad-network delivery.")
	.parse(process.argv);
