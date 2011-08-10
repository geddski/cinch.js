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
			to: function(controller){
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
		return $(populatedHTML);
	};

	return cinch;
});