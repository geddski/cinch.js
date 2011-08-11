require({
	paths: {
		'cinch': '../cinch',
		'text': "lib/text",
		'jQuery' : "lib/jquery-1.6.2"
	}
});

require(['cinch', 'jQuery', 'lib/qunit', 'lib/handlebars'], function(cinch) {

	//setup/takedown
	module("cinch.js", {
		setup: function() {
			
		},
		teardown: function() {

		}
	});

	test("create grips on the interesting parts of the populated template", function(){
		var simpleTemplate = Handlebars.compile("<div data-grip='message'>{{message}}</div>");
		var model = { message: "Hi There" };
		var populated = simpleTemplate(model);
		var view = cinch.grip(populated);
		ok(typeof view === 'object', 'view should be an object');
		ok(typeof view.root === 'object', 'view.root should be an object');
		ok(typeof view.message === 'object', 'view.message should be a jquery object');
		//normal jQuery usage on the grips
		view.message.text('yay cinch.js').addClass('easy');
		ok(view.message.text(), 'yay cinch.js', 'grip should be a regular jQuery object');
		ok(view.message.hasClass('easy'), 'yay cinch.js', 'grip should be a regular jQuery object');
		ok(view['undefined'] === undefined, 'root element should only become a grip if it has the data-grip property');
	});

	//todo cinch(model, view).to(this);
});