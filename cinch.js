define(['jQuery'], function() {
	/**
	 * cinch creates or adds to a controller
	 * @param model
	 * @param view
	 */
	function cinch(model, view) {
		//var shared

		return {
			view: view,
			model: model,
			to: function(controller) {
				console.log('cinching model and view to the controller');
			}
		}
	}

	/**
	 * grip creates a view out of the populated HTML
	 * @param populatedHTML
	 */
	cinch.grip = function(populatedHTML) {
		console.log('you wants grips?');
		//todo create grips
		var view = {
			root: $(populatedHTML)
		};
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

	return cinch;
});