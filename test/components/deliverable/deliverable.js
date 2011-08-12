define(['lib/text!./deliverable.html', 'cinch'], function(html, cinch){
	function Deliverable(model, populatedHTML){
		console.log('new deliverable created');
		this.model = model;
//		console.log('typeof populatedHTML: ', typeof populatedHTML);
		populatedHTML = populatedHTML || Deliverable.template(this.model);
		var test = "<div class='deliverable'>< span data-grip='name'>Feature C</span><span data-grip='status'>Delivered</span>< /div>";
		this.view = cinch(this.model, populatedHTML).to(this);
//		this.view = cinch(this.model, test).to(this);
//		console.log('this.view: ', this.view);
	}
	
	Deliverable.template = Handlebars.compile(html);
	Handlebars.registerPartial('Deliverable', Deliverable.template);
	return Deliverable;
});