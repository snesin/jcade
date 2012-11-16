# jcade - jQuery Create and Destroy Events

The jcade plug-in adds the `create` event to jQuery, providing easy and automatic binding to **future elements**. jcade also integrates with jQuery UI to allow simpler widget HTML. Any widget library can take advantage of jcade.

At the heart of jcade is the `create` event that it adds to jQuery. With it, any document node can listen for new sub-nodes based on a selector. For example, to raise an event for any **future** anchor (`<a>`) elements added to the document by any means:

    $( document ).create( "a", function( event ) {
       alert( event.target );
    });

The `create` event is fired on **future elements** regardless of how they are added; via page source, document.write, innerHTML assignments, jQuery methods, methods from other frameworks, or by any means.

jcade provides widget authors an easy way to automatically bind elements to widget classes. With jQuery UI and jcade included, site authors can simply add the following HTML to their page:

    <div class="jQuery.ui.slider" />

The `slider` class will automatically be bound to the element without the site author needing to write any script. The site author does not have to track what new widget elements will need binding, it happens automatically. This allows the site author to 'write less, do more' as well.


jcade can work with any widget framework, not just jQuery UI. It adds the `$.uiFactory` method which encapsulates the binding into a simple function call. For example, if you have a JavaScript widget class `myNamespace.widgets.colorpicker`, simply include jcade and call the following from your class declaration code:

    $.uiFactory( "myNamespace.widgets.colorpicker" );

Then the site author simply needs to put the following HTML on the page, and the element is automatically bound when added to the document by any means:

    <input class="myNamespace.widgets.colorpicker" />

A single element can have multiple bindings. All classes will be invoked with the element. For example:

    <input class="jQuery.ui.datepicker jQuery.ui.autocomplete" />

Options for widget classes are declared as an attribute of the HTML element. The attribute can be named `classname:options`, or fully qualified `fullclasspath:options`. The value of the attribute is JSON text. Examples of each:

    <div class="jQuery.ui.slider" slider:options="orientation:'vertical',value:50" />
    <div class="jQuery.ui.slider" jQuery.ui.slider:options="orientation:'vertical',value:50"  />


jcade also adds a `destroy` event that can be used to perform instance clean-up. For example:

    $( element ).destroy( function( event ) { 
        alert( event.target.tagName + " being removed" );
    });

## API

### `create` Signatures

The `create` method is typically used to pass a selector and event handler to the `document` object:

    // selector     : Selector for future elements, such as tagName.className.
    // eventHandler : The function to execute when an element matching the selector is created.
    $( document ).create( selector, eventHandler );

You can assign `create` events to nodes other than `document` as well. The handler will get called when descendants (to any level) matching the selector are created. The generic signature of the `create` method is:

    // rootSelector : Such as document, new elements added in the sub-tree of this/these
    //                 elements will trigger event.
    // selector     : Selector for future elements, such as tagName.className.
    // eventData    : Data to be passed to event.
    // eventHandler : The function to execute when an element matching the selector is created.
    // notExisting  : False, call handler for matching elements already on the page. (Default)
    //                 True. do not call the handler for pre-existing elements.
    $( rootSelector ).create( selector [, eventData], eventHandler [, notForExisting] );

### `uiFactory` Signatures

The `uiFactory` method is the easiest route to automatically bind widget classes to HTML elements by the className attribute. Options will automatically be passed to the class as described above as well. Just let the `uiFactory` know the class exists by passing it a string with the full path:

    // className      : A string containing the full path of JavaScript widget class.
    $.uiFactory( className );

Multiple classes can be registered at once, and the factory fully customized with optional parameters like so:

    // className      : Full path of JavaScript widget class.
    // factoryOptions : Options for the factory, see next section.
    $.uiFactory( className [, className ...] [, factoryOptions] );

### `factoryOptions` Properties

The behavior of the `uiFactory` method can be altered by passing a `factoryOptions` object as the last parameter. It can contain any of the following properties:

    // invoker       : A function that invokes the class, The arguments passed to invoker 
    //                  are options, element and factory.
    // reverseArgs   : False, pass options,element,factory when calling invoker. (Default)
    //                  True, pass element,options,factory when calling invoker.
    // options       : Options to pass to the invoker. Will be extended with options 
    //                  specified in the HTML.
    // optionsName   : Format of the HTML attribute name containing JSON options for the
    //                  invocation. By default '*:options'. The * will first be replaced
    //                  by the class name, and if not found, then by the full class path.
    // optionsParser : A function to parse the options attribute value.
    // notExisting   : False, invoke classes for elements already on the page. (Default)
    //                  True, do not invoke classes for elements already on the page.
    // filter        : A function called before the invoker with the element and options. 
    //                  Return false to not invoke the class for that element.


### `destroy` Signature

The `destroy` method attaches an event that is fired when the element is removed from the document.

    // eventData    : Data to be passed to event.
    // eventHandler : The function to execute when the element is removed.
    $( element ).destroy( [ eventData,] eventHandler );

## Supported browsers

jcade works in all the major browsers, including:

* IE
* Chrome
* Firefox
* Safari
* Opera

## How does it work

**It does not use an interval.**

For Microsoft's Internet Explorer 5-8, jcade uses [behaviors](http://msdn.microsoft.com/en-us/library/ms531018\(v=VS.85\).aspx) to trigger the events, and the two `.htc` files will be needed. The path to both `.htc` files is controlled by the `jQuery.fn.create.htcPath` variable. By default it will be set to the same path as the script containing `jcade.js` or `jcade.min.js`. If neither is found, it is blank, and the files are assumed to be in the same folder as the page. The value of `jQuery.fn.create.htcPath` can be set as needed. The `.htc` files must have the same document domain as the page.

For IE9+ and all non-IE browsers, jcade uses `DOMNodeInserted` (delayed with a timer) and `DOMNodeRemoved` events.

## License

The jcade plugin is dual licensed *(just like jQuery)* under the MIT (MIT\_LICENSE.txt) and GPL Version 2 (GPL\_LICENSE.txt) licenses.

Copyright (c) 2011-2012 [Scott Nesin](http://scottnesin.com/)
