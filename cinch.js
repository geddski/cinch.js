define(['jQuery'], function() {
	/**
	 * cinch creates or adds to a controller
	 * @param model
	 * @param view an actual view (created by cinch.js) or a string or a DOM element to be turned into a view
	 */
	function cinch(model, view) {
		//var shared
		//if view is a string or vanilla DOM element, grip it (turn it into a real view)
		if(!view.isView){ view = cinch.grip(view); }
		
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
		view.root.find('[data-grip]').andSelf().each(function() {
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


	cinch.group = function(models, grip, callback){
		//group is the controller for the group
		var group = {
			items: [],
			view: {
				root: grip
			}
		};

		var views = grip.children();
		for (var i = 0; i < models.length; i++) {
			if (typeof callback === "function") {
				group.items.push(callback(models[i], group.view.root.children()[i]));
			}
			else{
				group.items.push({
					view: {
						root: views[i]
					},
					model: models[i]
				});
			}

		}

		group.add = function(model, html){
			//todo maybe call grip on the html in case it has data-grips
			html = $(html);
			//add to model
			models.push(model);
			//add to view
			this.view.root.append(html);

			//add to items
			group.items.push({
				view: {
					root: html
				},
				model: model
			})
		};

		group.remove = function(item){
			//remove from model
			models.splice(models.indexOf(item.model), 1);
			//remove from view
			$(item.view.root).remove();
			//remove from group
			this.items.splice(this.items.indexOf(item), 1);
		};

		return group;
	};
	/**
	 * create a group of components, with methods for adding/removing/replacing/updating
	 * @param Component
	 * @param modelArray
	 * @param groupTemplate
	 * @param callback - function for when the component needs a custom constructor
	 * that's different from the conventional (model, populatedHTML)
	 */
//	cinch.group = function(Component, modelArray, html, callback) {
//		//controller for the group of components
//		var group = {
//			instances: [],
//			model: modelArray,
//			view: {
//				//create actual DOM elements out of the populated HTML if not already
//				root: typeof html === 'string' ? $(html).children() : html.children()
//			}
//		};
//
//		/**
//		 * add item to the group - inserts it into the DOM and the model
//		 * @param controller
//		 * @param modelName optional name if not using 'model' convention
//		 * @param viewName optional name if not using 'view' convention
//		 */
//		group.add = function(controller, modelName, viewName) {
//			var _this = this;
//			var model = controller.model;
//			var view = controller.view;
//			if (modelName) {
//				model = controller[modelName];
//			}
//			if (viewName) {
//				view = controller[viewName];
//			}
//
//			//add to model
//			this.model.push(model);
//
//			//add to view
//			this.view.root = this.view.root.add(view.root);
//			this.view.root.parent().append(view.root);
//
//			//add controller to instances
//			this.instances.push(controller);
//
//			//allow chaining
//			return controller;
//		};
//
//		/**
//		 * remove item from the group - deletes it from the DOM and the model
//		 * @param controller
//		 * @param modelName optional name if not using 'model' convention
//		 * @param viewName optional name if not using 'view' convention
//		 */
//		group.remove = function(controller, modelName, viewName) {
//			var _this = this;
//			var model = controller.model;
//			var view = controller.view;
//			if (modelName) {
//				model = controller[modelName];
//			}
//			if (viewName) {
//				view = controller[viewName];
//			}
//
//			//remove from model
//			this.model.splice(this.model.indexOf(model), 1);
//
//			//remove from view
//			var index = $.inArray(view.root.get(0), this.view.root);
//			this.view.root.splice(index, 1);
//			view.root.remove();
//
//			//delete controller from instances
//			this.instances.splice(this.instances.indexOf(controller), 1);
//		};
//
//		//small break in execution so that the populated template can be inserted in the DOM without waiting for
//		//the binding to finish. Should give a good performance increase.
//		setTimeout(function() {
//			createComponents();
//		}, 0);
//
//		/**
//		 * create instances of the components.
//		 */
//		function createComponents() {
//			for (var i = 0; i < modelArray.length; i++) {
//				//create new instance of the component, passing in the model and the populated HTML
//				if (typeof callback === "function") {
//					group.instances.push(callback(modelArray[i], group.view.root[i]));
//				}
//				else {
//					//if no callback is provided call the conventional constructor.
//					// convention: assume the first two params are the model and the populatedHTML
//					group.instances.push(new Component(modelArray[i], group.view.root[i]));
//				}
//			}
//		}
//
//		return group;
//	};

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