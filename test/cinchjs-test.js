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

	test("syntax sugar: cinch will call grip if you haven't already. Allows usage in one line", function(){
		var template = Handlebars.compile("<div data-grip='message'>{{message}}</div>");
		var model = { message: "Hi There", id: 4 };
		var controller = {};
		var view = cinch(model, template(model)).to(controller);
		controller.setMessage('mmm sugar');
		equals(model.message, 'mmm sugar', "model should be updated");
		equals(view.message.text(), 'mmm sugar', "view should be updated");
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

	/**
	 * Delegate part of the model and part of the view to a dedicated component.
	 * A nested component has no idea its only working with a slice of the pie
	 * it uses cinch.js to keep its DOM and model up to date just like any component
	 * the parent's model stays up to date thanks to pass-by-reference
	 */
	asyncTest("nested components", function(){
		require(['components/switcher/switcher'], function(Switcher){
			var template = Handlebars.compile("<div>{{message}}<br/><div data-grip='isOn'/></div>");
			var model = {
				message: "Nested Switcher Component",
				isOn: new Boolean(true)
			};
			var controller = {
				//delegate part of the model and part of the view to a dedicated component.
				switcher: new Switcher(model.isOn)
			};
			var view = cinch(model.isOn, template(model)).to(controller);

			//insert the nested component's view
			view.isOn.replaceWith(controller.switcher.view.root);

			ok(controller.switcher.model.isOn === model.isOn, "nested component's model should reference the same object as the parent model");
			equals(controller.switcher.model.isOn.valueOf(), true, "nested component's model should be set");
			controller.switcher.setIsOn(false);
			equals(controller.switcher.model.isOn.valueOf(), false, "nested component's model should be updated");

			controller.switcher.on('switched', function(isOn){
				equals(isOn, model.isOn, "parent and nested models should reference the same object, and update it")
				start(); //start the async tests
			});

			//emulate a click on the nested component, which fires the custom event
			controller.switcher.view.root.click();
			$('body').append(view.root);
		});
	});

	test("databinding", function() {
		var template = Handlebars.compile("<input type='text' data-grip='name' value='{{name}}'/>");
		var model = {name: "James Bond"};
		var controller = {};
		var view = cinch(model, template(model)).to(controller);

		//emulate user by putting new data into a form and firing the change event
		view.name.val("007");
		view.name.trigger('change');

		//model and view should have the newly entered data
		equals(model.name, "007", "model should be updated by the change event");

		//custom setter
		controller.setName = function(value) {
			var caps = value.toUpperCase();
			view.name.val(caps);
			model.name = caps;
		};

		//test that custom setter gets called on event
		view.name.val("Double Agent");
		view.name.trigger('change');
		equals(model.name, "DOUBLE AGENT", "model should be updated by the change event, using custom setter");
	});

	test("databinding with other event (keyup for example)", function() {
		var template = Handlebars.compile("<input type='text' data-grip='name' value='{{name}}'/>");
		var model = {name: "James Bond"};
		var controller = {};
		var view = cinch(model, template(model)).to(controller, {inputEvents: {'name': 'keyup'}});

		//custom setter
		controller.setName = function(value) {
			var caps = value.toUpperCase();
			view.name.val(caps);
			model.name = caps;
		};

		//emulate user by putting new data into a form and firing the keyup event
		view.name.val("j");
		view.name.trigger('keyup');
		equals(model.name, "J", "model should be updated by the keyup event");
		view.name.val("jo");
		view.name.trigger('keyup');
		equals(model.name, "JO", "model should be updated by the keyup event");
//		$('body').append(view.root);
	});

	/**
	 * templates are fantastic at creating lists from an array, but provide no way to update that list and its underlying model.
	 * cinch.js provides that functionality when you create a group
	 */
	test("simple groups", function(){
		//todo move to a plugin or into cinch.js?
		var linkTemplate = Handlebars.compile("<a href='{{url}}'>{{name}}</a>");
		Handlebars.registerPartial('link',linkTemplate);
		var linksTemplate = Handlebars.compile("<ul data-group='links'>{{#links}}{{> link}}{{/links}}</ul>");
		var model = {
			links: [
				{name: "Google", url: "http://google.com"},
				{name: "Apple", url: "http://apple.com"},
				{name: "Amazon", url: "http://amazon.com"}
			] 
		};

		var controller = {};
		var view = cinch(model, linksTemplate(model)).to(controller);

		//turn the populated list of links into a group
		controller.links = cinch.group(model.links, view.links);

		//add a new one to the group
		var newLink = {name: "Microsoft", url: "http://microsoft.com"};
		controller.links.add(newLink, linkTemplate(newLink));
		equals(controller.links.view.root.children().length, 4, "item should have been added to the group view");
		equals(model.links.length, 4, "item should have been added to the model");
		equals(controller.links.items.length, 4, "item should have been added to the items array of controllers");

		var lastestLink = controller.links.items[3];
		equals(lastestLink.model.name, "Microsoft", "model should be set");
		equals(lastestLink.view.root.attr('href'), "http://microsoft.com", "view should be set");

		//remove one from the group
		var apple = controller.links.items[1];
		controller.links.remove(apple);
		equals(controller.links.view.root.children().length, 3, "item should have been removed from the group view");
		equals(model.links.length, 3, "item should have been removed from the model");
		equals(controller.links.items.length, 3, "item should have been removed from the items array of controllers");
		
		$('body').append(view.root);
	});

	/**
	 * a group can be a collection of component instances
	 */
	asyncTest("group of components", function(){
		require(['components/deliverable/deliverable'], function(Deliverable){
			//1. populate the deliverables with a template then pass that html string to the group
			var template = Handlebars.compile("<h1>{{project}}</h1><div data-group='deliverables'>{{#deliverables}}{{> Deliverable}}{{/deliverables}}</div>");
			var model = {
				project: "Project A",
				deliverables: [
					{name: "Feature A", status: "On Schedule"},
					{name: "Feature B", status: "Missed"},
					{name: "Feature C", status: "Delivered"},
					{name: "Feature D", status: "At Risk"}
				]
			};
			var controller = {};
			var view = cinch(model, template(model)).to(controller);
			ok(view.name === undefined, "groups' grips should not be created in the parent view");
			ok(view.status === undefined, "groups' grips should not be created in the parent view");

			controller.deliverables = cinch.group(model.deliverables, view.deliverables, function(model, html){
				return new Deliverable(model, html);
			});
			equals(controller.deliverables.view.root.children().length, 4, "groups view should be setup");
			equals(controller.deliverables.items.length, 4, "items should have been setup");

			var deliverable = controller.deliverables.items[0];
			ok(deliverable instanceof Deliverable, "new instances of the component should have been created");
			equals(typeof deliverable.view, "object", "view should have been created by cinch");
			equals(typeof deliverable.view.root, "object", "view should have been created by cinch");

			//add a new one
			var newModel = {name: "Feature E", status: "On Schedule"};
			controller.deliverables.add(newModel, Deliverable.template(newModel));
			equals(controller.deliverables.view.root.children().length, 5, "item should have been added to the group view");
			equals(model.deliverables.length, 5, "item should have been added to the model");
			equals(controller.deliverables.items.length, 5, "item should have been added to the items array of controllers");
			var latest = controller.deliverables.items[4];
			ok(latest instanceof Deliverable, "new instances of the component should have been created");

			//remove one
			var featureB = controller.deliverables.items[1];
			controller.deliverables.remove(featureB);
			equals(controller.deliverables.view.root.children().length, 4, "item should have been removed from the group view");
			equals(model.deliverables.length, 4, "item should have been removed from the model");
			equals(controller.deliverables.items.length, 4, "item should have been removed from the items array of controllers");


			$('body').append(view.root);

			//todo 2. let the component create its own html and use that

			start();
		});
	});
});