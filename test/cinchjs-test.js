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
		var simple = "<div data-grip='message'>{{message}}</div>";
		var simpleTemplate = Handlebars.compile(simple);
		var model = {
			message: "Hi There"
		};
		var populated = simpleTemplate(model);
		console.log('populated: ', populated);
		var view = cinch.grip(populated);
		view.addClass('1');
		cinch(model, view).to(this);
	});
});