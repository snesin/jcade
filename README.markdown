# jcade - jQuery Create and Destroy Events

The jcade plug-in adds `create` and `destroy` events to jQuery. When an element that matches a selector is added to the page, the `create` event is triggered. When an element is removed, the `destroy` event is triggered.

For example, the following code will listen for new elements with a className of `myNamespace.widgets.ColorPicker` and create an instance of a JavaScript `myNamespace.widgets.ColorPicker` for each:
    
    // Listen for new elements and instantiate instances of the above class
    $(document).create(".myNamespace\\.widgets\\.ColorPicker",function(event){
        new myNamespace.widgets.ColorPicker(null,event.target);
    });

Then you can add elements to the page anywhere like so:

    <input class="myNamespace.widgets.ColorPicker" />
  
The event is triggered regardless where the element is in the document or how the element was created (via innerHTML assignments, jQuery methods, or methods from other frameworks).

The jcade plug-in adds also adds the `$.uiFactory` helper method, which encapsulates the binding and instantiating into a simple function call. The above three lines of JavaScript can be replaced with a single one:

    $.uiFactory("myNamespace.widgets.ColorPicker");

Using the `$.uiFactory` method, options defined in the HTML will also be passed to the constructor. For example, the HTML could then look like so:

    <input class="myNamespace.widgets.ColorPicker" ColorPicker:options="disabled:false, format:'HSV'" />

Behind the scenes, after using the `$.uiFactory` method, inserting the above HTML would trigger the following in JavaScript:

    new myNamespace.widgets.ColorPicker({disabled:false, format:'HSV'},element);

Though used far less often, the `destroy` event can be used to perform clean-up. A hypothetical class:

    myNamespace.widgets.ColorPicker = function( element ) {
         var self=this;
         $( element ).destroy( function( event ){ self.elementDestroyed( event );});
    };
    myNamespace.widgets.ColorPicker.prototype.elementDestroyed = function( event ) {
        //perform cleanup
    };

## API

### `uiFactory` Signature

The `uiFactory` method is the preferred method for instantiating a JavaScript class by the className attribute when an element is added to the DOM:

    // className      : The name of the JavaScript class, also used in the className of the element
    // factoryOptions : (optional) options for the factory, see last section.
    $.uiFactory( className[, className ...][, factoryOptions] );

### `create` Signature

The `create` method is typically used to pass a selector and event handler to the `document` object:

    // selector       : such as tagName.className
    // eventData      : (optional) data to be passed to event
    // eventHandler   : the function to execute when an element matching the selector is created
    // notForExisting : (optional) do not call for matching elements already on the page (default is false, 
    //                  the handler will be called for pre-existing matching elements)
    $(document).create( selector[, eventData], eventHandler[, notForExisting] );

You can assign create events to nodes other than `document` as well. The handler will get called when descendants (to any level) matching the selector are created.

### `destroy` Signature

The `destroy` method attaches an event that is fired when the element is removed from the document.

    // eventData    : (optional) data to be passed to event
    // eventHandler : the function to execute when the element is removed
    $(element).destroy([ eventData,]  eventHandler);

### `factoryOptions` Properties

The behavior of the `uiFactory` method can be altered by passing a `factoryOptions` object as the last parameter.

    // finder      : a function that returns the class to instantiate, which will be passed 
    //               the options and element
    // reverseArgs : false, pass options,element when instantiating (default)
    //               true, pass element,options when instantiating
    // optionsAttr : format of the HTML attribute name containing JSON options for the 
    //               instantiation by default '*:options" where the * will first be
    //               replaced by the class name, then by the full class path
    // noExisting  : false, instantiate classes for elements already on the page (default)
    //               true, do not instantiate classes for elements already on the page

## Supported browsers

It seems to work on the following browsers. If you have any other information, please let me know.

* IE 5.5+
* Chrome
* Firefox
* Safari
* Opera

Anything else is anybody's guess. Try it and let me know.

## How does it work

**It does not use an interval.**

For Microsoft's Internet Explorer, it uses [behaviors](http://msdn.microsoft.com/en-us/library/ms531018\(v=VS.85\).aspx) to trigger the events, and the two `.htc` files will be needed. The path to both `.htc` files is controlled by the `jQuery.fn.create.htcPath` variable. By default it will be set to the same path as the script containing `jcade.js` or `jcade.min.js`. If neither is found, it is blank, and the files are assumed to be in the same folder as the page. The value of `jQuery.fn.create.htcPath` can be set as needed. The `.htc` files must have the same document domain as the page.

For non-IE browsers, it uses `DOMNodeInserted` (delayed with a timer) and `DOMNodeRemoved` events.

## License

The jcade plugin is dual licensed *(just like jQuery)* under the MIT (MIT\_LICENSE.txt) and GPL Version 2 (GPL\_LICENSE.txt) licenses.

Copyright (c) 2011 [Scott Nesin](http://scottnesin.com/)
