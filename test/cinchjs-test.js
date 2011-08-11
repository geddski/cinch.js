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

	test("create grips on the interesting parts of the populated template", function() {
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

	test("cinch a view and a model to a controller", function() {
		var simpleTemplate = Handlebars.compile("<div data-grip='message'>{{message}}</div>");
		var model = { message: "Hi There", id: 4 };
		var view = cinch.grip(simpleTemplate(model));
		var controller = {};
		cinch(model, view).to(controller);
		ok(typeof controller.setMessage === "function", "setMessage should be a function");
		ok(typeof controller.setId === "undefined", "setId should NOT be a function because there is no grip for it");
		controller.setMessage("I love JS");
		equals(model.message, "I love JS", "model should have been updated");
		equals(view.message.text(), "I love JS", "view should have been updated");
		//set field as html (text by default)
		controller.setMessage("<b>Important</b>", {as: 'html'});
		equals(model.message, "<b>Important</b>", "model should have been updated");
		equals(view.message.text(), "Important");
		equals(view.message.html(), "<b>Important</b>", "view should have been updated as HTML");
	});

	test("multiple grips with the same name should all get updated", function() {
		var template = Handlebars.compile("<div><h1 data-grip='message'>{{message}}</h1><div data-grip='message'>{{message}}</div></div>");
		var model = { message: "Hi There"};
		var view = cinch.grip(template(model));
		var controller = {};
		cinch(model, view).to(controller);
		equals(view.message.length, 2, 'message grip should be a jQuery collection of the two elements');
		controller.setMessage("both");
		equals(view.message[0].innerHTML, "both");
		equals(view.message[1].innerHTML, "both");
	});

	test("defining a setter on the controller overrides the generic setter made by cinch.js", function() {
		var template = Handlebars.compile("<div data-grip='message'>{{message}}</div>");
		var model = { message: "Hi There"};
		var view = cinch.grip(template(model));
		var controller = {
			setMessage: function(value) {
				model.message = value.toLowerCase();
				view.message.html(value.toLowerCase());
			}
		};
		cinch(model, view).to(controller);
		controller.setMessage('Who Likes Caps?');
		equals(model.message, "who likes caps?", "custom setter should have removed caps");
		//redefine the custom setter and test again
		controller.setMessage = function(value){
			model.message = value.toUpperCase();
			view.message.html(value.toUpperCase());
		};
		controller.setMessage("Who Likes Caps?");
		equals(model.message, "WHO LIKES CAPS?", "custom setter should have added caps");
	});

	test("custom setter method defined in the controller's prototype", function() {
		function MyController(model, populatedHTML) {
			this.model = model;
			this.view = cinch.grip(populatedHTML);
			cinch(this.model, this.view).to(this);
		}
		MyController.prototype.setMessage = function(value) {
			this.model.message = value.toUpperCase();
			this.view.message.text(value.toUpperCase());
		};
		MyController.template = Handlebars.compile("<div data-grip='message'>{{message}}</div>");

		var data = {message: "OOP FTW"};
		var myController = new MyController(data, MyController.template(data));
		myController.setMessage("Custom Title");
		equals(myController.model.message, 'CUSTOM TITLE');
		equals(myController.view.message.text(), 'CUSTOM TITLE');
	});
	

	//todo test passing a string as the view instead of a view. cinch should create the view for you.


});