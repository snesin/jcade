# jcade - jQuery Create and Destroy Events

The jcade plug-in adds `create` and `destroy` events to jQuery. When an element that matches a selector is added to the page, the `create` event is triggered. When an element is removed, the `destroy` event is triggered.

For example, the following code will listen for new elements with a className of `myNamespace.MyController` and create an instance of a JavaScript `myNamespace.MyController` for each:

    // A simple class
    $.Controller('myNamespace.MyController',{
        init : function(){
        }
    });
    
    // Listen for new elements and instantiate instances of the above class
    $(document).create(".myNamespace\\.MyController",function(element,event){
        new myNamespace.MyClass(element);
    });

Then you can add elements to the page anywhere like so:

    <div class="myNamespace.MyController" />
  
The event is triggered regardless where the element is in the document or how the element was created (via innerHTML assignments, jQuery methods, or methods from other libraries).

Though used far less often, the `destroy` event can be used to perform clean-up. A modified class from above:

    $.Controller('myNamespace.MyController',{
        init : function(){
        },
        ".myNamespace\\.MyController destroy":function(element,event)
        {
            //Perform clean-up here.
        }
    });

## API

### `create` Signature

The `create` method is typically used to pass a selector and event handler to the document:

    // selector: such as tagName.className
    // eventHandler: the function to execute when an element matching the selector is created
    // notForExisting: do not call for matching elements already on the page (default is false, 
    //                 the handler will be called for pre-existing matching elements)
    $(document).create( selector, eventHandler[, notForExisting] );

You can assign create events to nodes other than the document as well. The handler will get called when decendants (to any level) matching the selector are created.

### `destroy` Signature

The `destroy` method attaches an event that is fired when the element is removed from the document.

    // eventHandler: the function to execute when the element is removed
    $(element).destroy( eventHandler);

## Supported browsers

It seems to work on the following browsers. If you have any other information, please let me know.
IE 5.5+
Chrome
Firefox
Safari
Opera

Anything else is anybody's guess. Try it and let me know.

## How does it work

It does not use an interval.

For Microsoft's Internet Explorer, it uses [behaviors](http://msdn.microsoft.com/en-us/library/ms531018\(v=VS.85\).aspx) to trigger the events, and the two .htc files will be needed. The path to both .htc files is controlled by the jQuery.fn.create.htcPath variable. By default it will be set to the same path as the script containing jcade.js or jcade.min.js. If neither is found, it is blank, and the files are assumed to be in the same folder as the page. The value of jQuery.fn.create.htcPath can be set as needed. The .htc files must have the same document domain as the page.

For non-IE browsers, it uses DOMNodeInserted (delayed with a timer) and DOMNodeRemoved events.

## License

The jcade plugin is dual licensed *(just like jQuery)* under the MIT (MIT\_LICENSE.txt) and GPL Version 2 (GPL\_LICENSE.txt) licenses.

Copyright (c) 2011 [Scott Nesin](http://scottnesin.com/)
