/*
 * Punch Blog Content Handler
 * https://github.com/laktek/punch-blog-content-handler
 *
 * Copyright (c) 2012 Lakshan Perera
 * Licensed under the MIT license.
 */

var _ = require("underscore");
var fs = require("fs");
var path = require("path");
var module_utils = require("punch").Utils.Module;
var default_content_handler = require("punch").ContentHandler;
var text_helper = require("punch").Helpers.Text;

module.exports = {

	contentDir: null,
	parser: null,

	setup: function(config) {
		var self = this;
		self.contentDir = config.content_dir;

		var markdown_parser = config.plugins.parsers[".markdown"];
		self.parser = module_utils.requireAndSetup(markdown_parser, config);
	},

	isSection: function(basepath) {
		return default_content_handler.isSection(basepath);
	},

	getSections: function(callback) {
		return default_content_handler.getSections(callback);
	},

	negotiateContent: function(basepath, output_extension, options, callback) {
		var self = this;
		var collected_contents = {};
		var content_options = {};
		var last_modified = null;

		// treat files with special output extensions
		if (output_extension !== ".html") {
			basepath = basepath + output_extension;
		}

		self.getContent(basepath, function(err, contents, modified_date) {
			if (!err) {
				collected_contents = _.extend(collected_contents, contents);
				last_modified = modified_date;

				var run_callback = function() {
					return callback(null, collected_contents, content_options, last_modified);
				};

				//fetch shared content
				default_content_handler.getSharedContent(function(err, shared_content, shared_modified_date) {
					if (!err) {
						collected_contents = _.extend(shared_content, collected_contents);
						if (shared_modified_date > last_modified) {
							last_modified = shared_modified_date;
						}
					}

					return run_callback();
				});
			} else {
				return callback("[Error: Content for " + basepath + " not found]", null, null, {});
			}
		});
	},

	getContentPaths: function(basepath, callback) {
		return default_content_handler.getContentPaths(basepath, callback);
	},

	getContent: function(basepath, callback) {
		var self = this;
		var output_object = {};
		var file_path = path.join(self.contentDir, basepath) + ".md";

		if (self.parser) {
			fs.stat(file_path, function(err, stat) {
				if (err) {
					return callback(err);
				}

				var modified_date = stat.mtime;

				fs.readFile(file_path, function(err, file_output) {
					if (err) {
						return callback(err);
					}

					parser.parse(file_output.toString(), function(err, parsed_output) {
						if (err) {
							return callback(err, null, modified_date);
						}

						//prepare the output
						output_object.content = parsed_output;
						output_object.last_modified = modified_date;
						output_object.title = text_helper.titleize(text_helper.humanize(basepath));

						return callback(null, output_object, modified_date);
					});
				});
			});
		} else {
			return callback("no parser found");
		}
	}
}
