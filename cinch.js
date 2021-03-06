define(['jQuery'], function() {
	/**
	 * cinch creates or adds to a controller
	 * @param model
	 * @param view an actual view (created by cinch.js) or a string or a DOM element to be turned into a view
	 */
	function cinch(model, view) {
		//var shared
		//if view is a string or vanilla DOM element, grip it (turn it into a real view)
		if (!view.isView) {
			view = cinch.grip(view);
		}

		return {
			view: view,
			model: model,
			//create setters on the controller, that update both the view and the model
			to: function(controller, options) {
				options = options || {};
				options.inputEvents = options.inputEvents || {};
				for (var key in view) {
					if (typeof view[key] === 'object' && model[key] !== undefined) {
						var setterName = "set" + capitaliseFirstLetter(key);

						//create the generic setter method on the controller if no custom setter exists
						if (typeof controller[setterName] !== 'function') {
							controller[setterName] = (function(key) {
								return function(value, options) {
									options = options || { as: 'text' };
									model[key] = value;
									cinch._setGrip(view[key], value, options.as);
								}
							}(key));
						}

						//userInput databinding enabled by default, only for certain types of elements
						if (options.userInput !== false && view[key].is('input, textarea, select')) {
							var inputEvent = options.inputEvents[key] || 'change';
							bindUserInput(controller, view[key], key, inputEvent);
						}
					}
				}
				//return the view so it can be assigned. makes 1-line cinching possible.
				return this.view;
			}
		}
	}

	/**
	 * grip creates a view out of the populated HTML
	 * @param populatedHTML
	 */
	cinch.grip = function(populatedHTML) {
		var view = { root: $(populatedHTML), isView: true };
		//also exclude grips that belong to a group, they'll get gripped later.
		view.root.find('[data-grip],[data-group]').andSelf().not('[data-group] [data-grip]').each(function() {
			//exclude the root element if it doesn't have data-grip attribute
			if ($(this).attr('data-grip')) {
				//if view item already exists, add it to collection of grips
				if (view[$(this).attr('data-grip')]) {
					view[$(this).attr('data-grip')] = view[$(this).attr('data-grip')].add($(this));
				}
				//otherwise set it to the single grip
				else {
					view[$(this).attr('data-grip')] = $(this);
				}
			}
			//add group to the view
			else if ($(this).attr('data-group')) {
				view[$(this).attr('data-group')] = $(this);
			}
		});
		return view;
	};

	/**
	 * set a grip's value in the view. used by the generated setters
	 */
	cinch._setGrip = function(grip, value, as) {
		//todo if grip points to multiple DOM elements, they may need to be updated separatly if different element types
		//todo support setting attributes like css, class, etc
		if (grip.is('input')) {
			//input fields
			grip.val(value);
		}
		else {
			//everything else (divs, spans, headers, etc)
			var attributeToChange = as || 'text';
			grip[attributeToChange](value);
		}
	};


	cinch.group = function(models, grip, callback) {
		//group is the controller for the group
		var group = {
			items: [],
			view: {
				root: grip
			},
			factory: callback
		};

		var views = grip.children();
		for (var i = 0; i < models.length; i++) {
			createController(models[i], group.view.root.children()[i], group.factory);
		}

		function createController(model, view, factory) {
			if (typeof factory === "function") {
				group.items.push(callback(model, view));
			}
			else {
				group.items.push({
					view: {
						root: view
					},
					model: model
				});
			}
		}

		group.add = function(model, html) {
			//todo maybe call grip on the html in case it has data-grips
			html = $(html);
			//add to model
			models.push(model);
			//add to view
			this.view.root.append(html);

			//add to items
			createController(model, html, this.factory);
		};

		group.remove = function(item) {
			//remove from model
			models.splice(models.indexOf(item.model), 1);
			//remove from view
			$(item.view.root).remove();
			//remove from group
			this.items.splice(this.items.indexOf(item), 1);
		};

		return group;
	};

	//-----utility functions-----//
	function capitaliseFirstLetter(string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	}

	//use the user's input as input to the setters.
	function bindUserInput(controller, field, key, inputEvent) {
		field.bind(inputEvent, function(e) {
			var setterName = "set" + capitaliseFirstLetter(key);
			controller[setterName](field.val());
		});
	}

	return cinch;
});