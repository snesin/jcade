/*!
 * jcade v0.2
 * http://github.com/snesin/jcade
 * 
 * jQuery create and destroy events
 * 
 * Copyright 2011, Scott Nesin
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
*/
(function( $ ) {
   var bindings=[],attr='jcade.create.tagged_',nextBindId=0;
   function getEvent(target,currentTarget,data) {
      var event=jQuery.Event('create');
      event.srcElement=event.target=target;
      event.delegateTarget=event.currentTarget=currentTarget;
      event.data=data;
      return event;
   }
   function searchAndHandle(selector,context,eventData,handler,bindId) {
      var list=[];
      context.each(function(cIndex,cElement) {
         $(selector,cElement).each(function(index,element) {
            if(!element[attr+bindId]) {
               list.push(element);
               handler(getEvent(element,cElement,eventData));
            }
         })
      });
      for (var i=0;i<list.length;i++) {
         list[i][attr+bindId]=true;
      }
      list=null;
   }
   function createdElementIE(element) {
      if (element[attr]) {
         return false;
      }
      var e=$(element);
      for (var i=0;i<bindings.length;i++) {
         if (e.is(bindings[i].selector)) {
            var c=bindings[i].context;
            for (var j=0;j<c.length;j++) {
               if ($.contains(c[j],element)) {
                  element[attr+bindings[i].bindId]=true;
                  bindings[i].handler(getEvent(element,c[j],bindings[i].data));
                  break;
               }
            }
         }
      }
   }
   $.fn.create=function(/*selector [,eventData] ,handler [,noExisting]*/) {
      if (arguments.length==1 && typeof(arguments[0])!=='string') {
         return createdElementIE(arguments[0]);
      }
      if ($.browser.msie && !document.getElementById('jcade.create.htc')) {
         $('HEAD').append('<style id="jcade.create.htc">.jcade\\.destroy {behavior:url('+$.fn.create.htcPath+'jcade.destroy.htc)}</style>');
      }
      if (arguments.length==0) {
         return this;
      }
      var selector=arguments[0],eventData=null,handler,noExisting=false,bindId=nextBindId++;
      if (arguments.length>2 && typeof(arguments[2])==='function') {
         eventData=arguments[1];
         handler=arguments[2];
         noExisting=arguments.length>3 && arguments[3];
      } else {
         handler=arguments[1];
         noExisting=arguments.length>2 && arguments[2];
      }
      if ($.browser.msie) {
         bindings.push({selector:selector,context:this,data:eventData,handler:handler,bindId:bindId});
         document.getElementById('jcade.create.htc').styleSheet.addRule(selector,'behavior:url('+$.fn.create.htcPath+'jcade.create.htc)',0);
      } else {
         var delayHandle=null;
         var self=this;
         this.bind('DOMNodeInserted.jcade.create',function(event) {
            if(!delayHandle) {
               delayHandle=window.setTimeout(function() {
                  delayHandle=null;
                  searchAndHandle(selector,self,eventData,handler,bindId);
               },1);
            }
         });
      }
      if (noExisting) {
         $(selector,this).each(function(index,e){e[attr]=true;});
      } else if ($.isReady) {
         searchAndHandle(selector,this,eventData,handler,bindId);
      } else if (!$.browser.msie) {
         $(function(){searchAndHandle(selector,self,eventData,handler,bindId);});
      }
      return this;
   };
   $.fn.create.htcPath=(function() {
      var scripts=document.getElementsByTagName('SCRIPT');
      for (var i=0;i<scripts.length;i++) {
         if (typeof(scripts[i].src)==='string' && scripts[i].src.search(/^(.*\b)jcade(\.min)?\.js(\?.*)?(#.*)?$/i)==0) {
            return RegExp.$1;
         }
      }
      return '';
   })();
})( jQuery );
(function($) {
   var bindings=[],attr='jcade.destroy.tagged_',nextBindId=0;
   function getEvent(target,data) {
      var event=jQuery.Event('destroy');
      event.currentTarget=event.target=target;
      event.data=data;
      return event;
   }
   function destroyedElementIE(element) {
      for (var i=0;i<bindings.length;i++) {
         if (bindings[i] && bindings[i].element===element) {
            element[attr+bindings[i].bindId]=true;
            bindings[i].handler(getEvent(element,bindings[i].data));
            bindings[i]=null;
         }
      }
   }
   $.fn.destroy=function(/*[ eventData,] handler, namespace*/) {
      if (arguments.length==1 && typeof(arguments[0])!=='function') {
         return destroyedElementIE(arguments[0]);
      }
      var eventData=null,handler,namespace=null,bindId=nextBindId++;
      if (arguments.length>1 && typeof(arguments[1])==='function') {
         eventData=arguments[0];
         handler=arguments[1];
         if (arguments.length>2 && typeof(arguments[2])==='string' && arguments[2].length>0) {
            namespace=arguments[2];
         }
      } else {
         handler=arguments[0];
         if (arguments.length>1 && typeof(arguments[1])==='string' && arguments[1].length>0) {
            namespace=arguments[1];
         }
      }
      this.addClass('jcade.destroy');
      if ($.browser.msie) {
         $.fn.create();
         this.each(function(index,element){bindings.push({element:element,namespace:namespace,data:eventData,handler:handler,bindId:bindId});});
      } else {
         this.bind('DOMNodeRemoved.jcade'+(namespace ? '.'+namespace : ''),function(event) {
            if (event.target!==event.currentTarget)
               return;
            $('.jcade\\.destroy',event.target).triggerHandler('DOMNodeRemoved');
            var e=$(event.target);
            if (e.hasClass('jcade.destroy') && !event.target[attr+bindId]) {
               event.target[attr+bindId]=true;
               handler(getEvent(event.target,eventData));
            }
         });
      }
      return this;
   };
})(jQuery);
(function($) {
   function makeFactory(classPath,factoryOptions) {
      var factory=$.extend({path:classPath,
                            name:classPath.split(".").pop(),
                            finder:new Function("return "+classPath),
                            reverseArgs:false,
                            options:null,
                            optionsAttr:"*:options",
                            noExisting:false,
                            handler:function(event) {
                               var options=event.target.getAttribute(factory.optionsAttr.replace(/\*/g,factory.name)) || event.target.getAttribute(factory.optionsAttr.replace(/\*/g,factory.path));
                               if (typeof(options)==="string") {
                                  options=(new Function("return {"+options+"};"))();
                               }
                               options=$.extend({},factory.options,options);
                               var element=$(event.target);
                               new (factory.finder(options,element))( factory.reverseArgs ?  element : options,factory.reverseArgs ?  options : element);
                            }
                           },factoryOptions);
      $(document).create("."+classPath.replace(/\./g,"\\."),factory.handler,factory.noExisting);
      return factory;
   }
   $.uiFactory=function(/* classPath [, classPath ...][,factoryOptions] */) {
      var factoryOptions=arguments.length>1 && typeof(arguments[arguments.length-1])!=="string" ? arguments[arguments.length-1] : null;
      for (var i=0;i<arguments.length;i++) {
         if (typeof(arguments[i])==="string")
            makeFactory(arguments[i],factoryOptions);
      }
      return this;
   };
})( jQuery );
