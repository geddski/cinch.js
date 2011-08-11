define(['lib/text!./switcher.html', 'cinch', '../../lib/pubsub', 'jQuery'], function(html, cinch, pubsub) {
	function Switcher(isOn) {
		this.model = {
			isOn: isOn || false
		};
		this.view = cinch(this.model, Switcher.template(this.model)).to(this);
		this.setIsOn(this.model.isOn);
		var _this = this;

		//events
		this.view.root.click(function(e) {
			e.preventDefault();
			_this.setIsOn(!_this.model.isOn);
		});
	}

	//custom setter that gets called instead of the generic set method
	Switcher.prototype.setIsOn = function(isOn) {
		//update the model
		this.model.isOn = isOn;
		//update the DOM
		//use valueOf since we're passing a Boolean object, not a primitive variable. (JS falsy quirk)
		if (isOn.valueOf()) {
			this.view.isOn.css('left', '51px');
		}
		else {
			this.view.isOn.css('left', '0px');
		}
		//fire a custom event
		this.fire('switched', this.model.isOn);
	};

	//enable publishing of custom events
	pubsub.makePublisher(Switcher.prototype);
	//make the compiled template a public static variable
	Switcher.template = Handlebars.compile(html);

	return Switcher;
});