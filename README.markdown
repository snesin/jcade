# jcade - jQuery Create and Destroy Events

The jcade plug-in adds `create` and `destroy` events to jQuery. When an element that matches a selector is added to the page, the `create` event is triggered. When an element is removed, the `destroy` event is triggered.

For example, the following code will listen for new elements with a className of `myNamespace.widgets.ColorPicker` and create an instance of a JavaScript `myNamespace.widgets.ColorPicker` for each:
    
    // Listen for new elements and instantiate instances of the above class
    $(document).create(".myNamespace\\.widgets\\.ColorPicker",function(event){
        new myNamespace.widgets.ColorPicker(event.target);
    });

Then you can add elements to the page anywhere like so:

    <input class="myNamespace.widgets.ColorPicker" />
  
The event is triggered regardless where the element is in the document or how the element was created (via innerHTML assignments, jQuery methods, or methods from other frameworks).

Though used far less often, the `destroy` event can be used to perform clean-up. A hypothetical class:

    myNamespace.widgets.ColorPicker = function( element ) {
         var self=this;
         $( element ).destroy( function( event ){ self.elementDestroyed( event );});
    };
    myNamespace.widgets.ColorPicker.prototype.elementDestroyed = function( event ) {
        //perform cleanup
    };

## API

### `create` Signature

The `create` method is typically used to pass a selector and event handler to the `document` object:

    // selector       : such as tagName.className
    // eventData      : (optional) data to be passed to event
    // eventHandler   : the function to execute when an element matching the selector is created
    // notForExisting : (optional) do not call for matching elements already on the page (default is false, 
    //                  the handler will be called for pre-existing matching elements)
    $(document).create( selector[, eventData], eventHandler[, notForExisting] );

You can assign create events to nodes other than `document` as well. The handler will get called when decendants (to any level) matching the selector are created.

### `destroy` Signature

The `destroy` method attaches an event that is fired when the element is removed from the document.

    // eventData    : (optional) data to be passed to event
    // eventHandler : the function to execute when the element is removed
    $(element).destroy([ eventData,]  eventHandler);

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
