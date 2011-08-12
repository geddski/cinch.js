define(['lib/text!./deliverable.html', 'cinch'], function(html, cinch){
	function Deliverable(model, populatedHTML){
		this.model = model;
		populatedHTML = populatedHTML || Deliverable.template(this.model);
		this.view = cinch(this.model, populatedHTML).to(this);
	}
	
	Deliverable.template = Handlebars.compile(html);
	Handlebars.registerPartial('Deliverable', Deliverable.template);
	return Deliverable;
});