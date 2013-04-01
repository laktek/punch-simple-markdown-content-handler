var _ = require("underscore");
var fs = require("fs");
var module_utils = require("punch").Utils.Module;
var default_content_handler = require("punch").ContentHandler;

var simple_markdown_content_handler = require('../lib/simple_markdown_content_handler.js');

describe("setup", function() {
	var sample_config = {
		content_dir: "content_dir",

		plugins: {
			parsers: {
				".markdown": "sample_markdown_parser",
			}
		}
	};

	it("set the content directory", function(){
		spyOn(module_utils, "requireAndSetup").andCallFake(function(id, config){
			return {"id": id};
		});

		simple_markdown_content_handler.setup(sample_config);
		expect(simple_markdown_content_handler.contentDir).toEqual("content_dir");
	});

	it("setup the markdown parser", function(){
		spyOn(module_utils, "requireAndSetup").andCallFake(function(id, config){
			return { "id": id, "supportedExtensions": [".markdown", ".md"] };
		});

		simple_markdown_content_handler.setup(sample_config);
		expect(simple_markdown_content_handler.parser).toEqual({"id": "sample_markdown_parser", "supportedExtensions": [".markdown", ".md"] });
	});
});

describe("is section", function() {
	it("delegate to default content handler", function(){
		spyOn(default_content_handler, "isSection");

		simple_markdown_content_handler.isSection('/some/path');
		expect(default_content_handler.isSection).toHaveBeenCalledWith('/some/path');
	});
});

describe("get sections", function() {
	it("delegate to the default content handler", function() {
		spyOn(default_content_handler, "getSections");

		var spyCallback = jasmine.createSpy();
		simple_markdown_content_handler.getSections(spyCallback);

		expect(default_content_handler.getSections).toHaveBeenCalledWith(spyCallback);
	});
});

describe("negotiate content", function() {

	it("get the content for the path", function(){
		spyOn(simple_markdown_content_handler, "getContent");
		var spyCallback = jasmine.createSpy();
		simple_markdown_content_handler.negotiateContent("path/test", ".html", {}, spyCallback);

		expect(simple_markdown_content_handler.getContent.mostRecentCall.args[0]).toEqual("path/test");
	});

	it("get the content for a path with special output format", function(){
		spyOn(simple_markdown_content_handler, "getContent");
		var spyCallback = jasmine.createSpy();
		simple_markdown_content_handler.negotiateContent("path/test", ".rss", {}, spyCallback);

		expect(simple_markdown_content_handler.getContent.mostRecentCall.args[0]).toEqual("path/test.rss");
	});

	it("extend it with shared contents", function(){
		spyOn(simple_markdown_content_handler, "getContent").andCallFake(function(path, callback){
			return callback(null, {});
		});

		spyOn(default_content_handler, "getSharedContent");

		var spyCallback = jasmine.createSpy();
		simple_markdown_content_handler.negotiateContent("path/test", ".html", {}, spyCallback);

		expect(default_content_handler.getSharedContent).toHaveBeenCalled();
	});

	it("call the callback with all collected content", function(){
		spyOn(simple_markdown_content_handler, "getContent").andCallFake(function(path, callback){
			return callback(null, {"content_key": "content_value"}, new Date(2013, 3, 1));
		});

		spyOn(default_content_handler, "getSharedContent").andCallFake(function(callback){
			return callback(null, {"shared_key": "shared_value"}, new Date(2013, 3, 1));
		});

		var spyCallback = jasmine.createSpy();
		simple_markdown_content_handler.negotiateContent("path/test", ".html", {}, spyCallback);

		expect(spyCallback).toHaveBeenCalledWith(null, { "content_key": "content_value", "shared_key": "shared_value" }, {}, new Date(2013, 3, 1));
	});

	it("call the callback with an error object, if content for path doesn't exist", function(){
		spyOn(simple_markdown_content_handler, "getContent").andCallFake(function(path, callback){
			return callback("error", null, null);
		});

		var spyCallback = jasmine.createSpy();
		simple_markdown_content_handler.negotiateContent("path/test", ".html", {}, spyCallback);

		expect(spyCallback).toHaveBeenCalledWith("[Error: Content for path/test not found]", null, null, {});
	});

});

describe("get content paths", function() {
	it("delegate to the default content handler", function() {
		spyOn(default_content_handler, "getContentPaths");

		var spyCallback = jasmine.createSpy();
		simple_markdown_content_handler.getContentPaths("/some/path", spyCallback);

		expect(default_content_handler.getContentPaths).toHaveBeenCalledWith("/some/path", spyCallback);
	});
});

describe("get contents", function() {
	beforeEach(function() {
		var fakeParser = jasmine.createSpy();
		simple_markdown_content_handler.parser = { parse: fakeParser };
	});

	it("set the page title from the filename", function() {
		spyOn(default_content_handler, "getSharedContent").andCallFake(function(callback) {
			return callback(null, {}, new Date(2012, 10, 20));
		});

		var spyCallback = jasmine.createSpy();
		simple_markdown_content_handler.getContent("/this-is-the-title", ".html", {}, spyCallback);

		expect(spyCallback).toHaveBeenCalledWith(null, { "title" : "This is the title" }, {}, jasmine.any(Date));
	});

	it("set the last updated date", function() {

	});

	it("set the parent paths", function() {

	});

	it("read and parse the markown file for the given path", function() {

	});

	it("render cotnent list for index pages", function() {

	});
});
