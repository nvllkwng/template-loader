## Template Loader for Handlebars
templateLoader.js provides a single, unified way to fetch Handlebars templates.

templateLoader loads your Handlebars template by checking if:

1.	the template already exists in Handlebars.templates, OR
2.	the template markup is included in the current page markup.

If the template isn't found locally, it will fire an ajax request to the server and grab it, compile it, and save it locally in case it's needed again later.


### Single Template Example
fetch a single template named "user-list-tmpl"
```
var templatePromise = templateLoader.get('user-list-tmpl');
templatePromise.done(function(tmpl) {
	//tmpl is the compiled Handlebars template function
	var html = tmpl(context); //ready to render!
});
```

### Template with Partials Example
list all partials required for the main template in an array as the second param
```
var templateWithPartialsPromise = templateLoader.get('user-page-tmpl', ['user-list-tmpl', 'teaser-tmpl']); 
templateWithPartialsPromise.done(function(tmpl) {
	//user-page-tmpl ready to use
	var userPageHTML = tmpl(context);
});
```

### Default options
```
options: {
    templateUrlRoot: '/static/templates',   //url root for the ajax call request when asking server for the templates 
    templateExt: '.handlebars.html',		//file extensions used in constructing the ajax url in the server call (e.g. AJAX request url for "templateLoader.get('my-template')" will /static/templates/my-template.handelbars.html)
    templateLotSelectorId: 'templates'		//ID for the template container in the DOM
}
```
If you need to change any of the default options, do this
```
templateLoader.setup({
	templateUrlRoot: '/my/templates/are/here/',
	templateExt: '.hbs'
});
```
If you're okay with the default options, templateLoader is ready to run without having to run .setup. Just include the script and start loading templates.

### AMD
You can also load templateLoader as a RequireJS AMD module.

### Dependencies
jQuery, Handlebars
