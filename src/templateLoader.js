/**
 * templateLoader.js
 *
 * Author:    Neville Kwong
 */
(function(root, factory) {
    'use strict';
    if(typeof define ==='function' && define.amd) {
        define(['jquery', 'handlebars'], factory);
    } else {
        window.templateLoader = factory(window.jQuery, window.Handlebars);
    }
}(this, function($, Handlebars, undefined) {
    'use strict';
    var templateLoader = {

        options: {
            templateUrlRoot: '/static/templates/',
            templateExt: '.handlebars.html',
            templateLotSelectorId: 'templates'
        },

        setup: function(options) {
            $.extend(this.options, options);
        },

        requestedTemplates: {},

        getSingleTemplate: function(templateName) {
            var tmpl = $('#' + templateName ),
                returnPromise = $.Deferred(),
                compiledTmpl,
                self = this;
            if(!Handlebars.templates) {
                Handlebars.templates = {};
            }
            if(Handlebars.templates[templateName]) {
                //look for it in the Handlebars namespace
                returnPromise.resolve(Handlebars.templates[templateName]);
            } else if( tmpl.length ) {
                //look for it in the DOM
                Handlebars.templates[templateName] = compiledTmpl = Handlebars.compile(tmpl.html());
                returnPromise.resolve(compiledTmpl);
            } else {
                if(this.requestedTemplates[templateName]) {
                    //this template has previously been requested and the ajax request to grab it is pending
                    return this.requestedTemplates[templateName];
                }
                //mark it as requested, so that subsequent request for the same template will not cause another ajax call
                this.requestedTemplates[templateName] = returnPromise;
                //fire an ajax request to grab it
                this.getTmplOverAjax(templateName).done(function(response) {
                    tmpl = self.ajaxHandler(response, templateName);
                    returnPromise.resolve(tmpl);
                });
            }
            return returnPromise;
        },
        
        getTmplOverAjax: function(templateName) {
            var templateURL = this.options.templateUrlRoot + templateName + this.options.templateExt;
            return $.ajax({
                url: templateURL
            });
        },
        
        ajaxHandler: function(response, templateName) {
            var $templatesLot = this.getTemplatesLot(),
                $scriptTag = $('<script>', {
                    'id': templateName,
                    'type': 'text/x-handlebars-template'
                }),
                tmpl;
            $scriptTag.text(response);
            //put the markup in the dom
            $templatesLot.append( $scriptTag );
            //compile the template, cache it in the Handlebars namespace
            Handlebars.templates[templateName] = tmpl = Handlebars.compile(response);
            //resolve promise with template
            //remove itself from promise cache
            if(this.requestedTemplates[templateName]) {
                this.requestedTemplates[templateName] = null;
            }
            return tmpl;
        },

        getTemplatesLot: function() {
            //grab the dom element that holds all templates, if it doesn't exist, create it
            var $templatesLot = $('#' + this.options.templateLotSelectorId);
            if( !$templatesLot.length ) {
                $templatesLot = $('<div>', {'id': this.options.templateLotSelectorId});
                $('body').append($templatesLot);
            }
            return $templatesLot;
        },

        getPartials: function(partials) {
            //given an array of template names, fetch each of them and register them as Handlebars partials
            var i, l, tmpPartial, partialName, partialsPromiseArr = [];
            for(i = 0, l = partials.length ; i < l ; i += 1) {
                partialName = partials[i];
                tmpPartial = this.getSingleTemplate(partialName);
                tmpPartial.done(this.registerPartial);
                partialsPromiseArr.push(tmpPartial);
            }
            return partialsPromiseArr;
        },

        registerPartial: function(tmpl, html, tname) {
            Handlebars.registerPartial(tname, tmpl);
        },

        //exposed API method
        get: function(templateName, partials) {
            if(!partials || !partials.length) {
                //if no partials are requested, just fetch the template
                return this.getSingleTemplate(templateName);
            }
            var templateFullyLoaded = $.Deferred(),
            templatePromiseArr;
            //grab partials first
            templatePromiseArr = this.getPartials(partials);
            //grab the main template, push the promise to the end of the promise array
            templatePromiseArr.push(this.getSingleTemplate(templateName, true));
            $.when.apply(this, templatePromiseArr).done(function() {
                //when all promises have returned...
                //grab the last one... it's the main template
                var mainTemplateArg = arguments[arguments.length-1];
                templateFullyLoaded.resolve(mainTemplateArg[0], mainTemplateArg[1], mainTemplateArg[2]);
            });
            return templateFullyLoaded;
        }
    };
    //export
    return templateLoader;
}));