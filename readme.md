# Cinch.js
Picks up where your micro templates left off.

## Beyond Micro Templates
One of the best ways to create HTML is by using a micro template solution, like handlebars.js. By combining a chunk of data and a template you can quickly create your app's UI with minimal effort.
But now what? You need to wire things up, respond to events, keep the DOM and the underlying model in sync, AND build your sweet app. Things can get messy fast. Your micro template would be sad if it knew what you were about to do with the clean HTML it gave you. Don't worry, Cinch.js has your back.

## Grips
Cinch.js gives you a grip on the interesting parts of your populated template, so you can modify, add to, replace, delete, hide, animate, do whatever you want to that UI element.
You choose which elements of the populated template you want a grip on by simply adding a named `data-grip` attribute.

## Setters
Cinch.js also generates generic setter methods that update both the DOM and the data model you populated your template with. What's the point? Well, which of the following would you rather do?

```javascript
this.setName = function(name){
  //query the DOM every single time so it doesn't feel left out
  var element = $(populatedTemplate).find('input.name');
  element.val(name);
  //if we wanted to keep the model up to date we'd have to do it manually (yawn)
  model.name = name;
};
this.setName("Monotonous Work, Isn't It");
```

or

```javascript
this.setName("I love JS");
```

These generic setter methods can be overriden at any time by simply defining the method yourself.

## Getters
You used data to populate the DOM, and now the DOM is changing. The user is typing, clicking, dragging, dropping, hovering, swiping. Your app is updating, manipulating, moving, showing, hiding, validating.
Your data model becomes out of date almost instantly. So what happens when your app needs to get a current value? It has no choice but to query the DOM for it.
Most JavaScript web apps are built this way - relying entirely on the DOM to store the current data. It may even seem like a good idea at first -- your app and your user both interact with the DOM...why not?
Aside from being incredibly expensive(slow), apps built this way are nearly impossible to test, difficult to maintain, and painful to develop.  

Again, take your pick:

```javascript
var name = $(populatedTemplate).find('input.name').val();
var email = $(populatedTemplate).find('input.email').val();
var phone = $(populatedTemplate).find('input.phone').val();
var wantsNewsletter = $(populatedTemplate).find('input.newsletter').attr('checked');
var interests = [];
$(populatedTemplate).find('div.interest.viewed').each(function(){
  interests.push($(this.find('.interest-name').text());
});
this.save(name, email, phone, wantsNewsletter, interests);
```

or

```javascript
this.save(model);
```

Cinch.js keeps the data model up to date, in sync with the DOM, so performing actions based on the latest data is almost too easy.
For this reason getters are not needed - just access the same javascript object you populated your template with. It's current. 

## Groups
Another thing templates handle really well is creating lists. Templates can create some HTML for each item in an array. But templates don't have any mechanism for *adding* or *removing* an individual item from the list.
Cinch.js gives you that for free.
Some template solutions like jQuery Templates do have a means of updating a rendered template, but it has to re-render the entire template - so you lose all your event listeners and state changes. Not ideal.
Groups in Cinch.js can be a list of anything; simple links or instances of your most complex component. And of course, adding and removing not only updates the DOM, but also the original JavaScript array used to create the list in the first place.

## Architecture
Cinch.js employs the excellent ["Passive View"](http://martinfowler.com/eaaDev/PassiveScreen.html) design pattern, encouraging the creation of components that consist of the following:

1. Model - plain JavaScript object representing the data. Usually comes from the server in the form of JSON. Cinch.js keeps it up to date as the user and app interact with the DOM.
2. View - HTML populated by a template, with DOM element grips added by Cinch.js
3. Controller - the brains of the component, responsible for the View(DOM) and the underlying Model(data). All logic goes here.
Cinch.js adds setters to this controller that update the View and the Model, keeping them in sync.
When the user enters input, that input gets passed to these setters.

## Summary
Consider this. Web apps basically consist of two things:

1. Your brilliant logic
2. UI CRUD

CRUD? Isn't that a database concept? Yes but it applies here too:  
__C__reate -  Micro templates were made for this, populating your UI in a fast, flexible way.  
__R__ead - Stop abusing the DOM, let Cinch.js keep your model up to date for you. Read that.  
__U__pdate - Updating the UI is easy with the UI grips Cinch creates for you.  
__D__elete - Deleting elements is also easy with the UI gribs. Sure beats writing jQuery selectors all over the place.  
Micro templates cover the C in CRUD, Cinch.js handles the rest. 

In case you forgot, JavaScript is a *dynamic* language. Let's take advantage of it. Why should a smart developer like *you* have write the tedious parts? Outsource them to Cinchland!
With Cinch.js you'll write far less code, that's easier to read, test, maintain, and be proud of. 