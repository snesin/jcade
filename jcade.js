/*!
 * jcade v0.5
 * http://github.com/snesin/jcade
 * 
 * jQuery create and destroy events
 * 
 * Copyright 2011-2012, Scott Nesin
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
*/
(function( $ ) {
   var useBehaviors=($.browser.msie && $.browser.version<9);
   var bindings=[],attr='jcade.create.tagged_',nextBindId=0;
   function getEvent(target,currentTarget,data) {
      var event=jQuery.Event('create');
      event.srcElement=event.target=target;
      event.delegateTarget=event.currentTarget=currentTarget;
      event.data=data;
      return event;
   }
   function searchAndHandle(selector,context,eventData,handler,bindId) {
      context.each(function(cIndex,cElement) {
         $(selector,cElement).each(function(index,element) {
            if(!element[attr+bindId]) {
               element[attr+bindId]=true;
               handler(getEvent(element,cElement,eventData));
            }
         })
      });
   }
   function createdElementIE(element) {
      var e=$(element);
      if (e[0][attr]) {
         return false;
      }
      for (var i=0;i<bindings.length;i++) {
         if (e.is(bindings[i].selector)) {
            var c=bindings[i].context;
            for (var j=0;j<c.length;j++) {
               if ($.contains(c[j],element) && !element[attr+bindings[i].bindId]) {
                  element[attr+bindings[i].bindId]=true;
                  bindings[i].handler(getEvent(element,c[j],bindings[i].data));
                  break;
               }
            }
         }
      }
   }
   function parseUrl(url) {
      if (url.search(/^([a-z]+:)\/\/(.+?)(:(\d*))?(\/.*?)([^\/]*?)(\?.*?)?(#.*)?$/i)===0) {
         return {protocol:RegExp.$1
                ,hostname:RegExp.$2
                ,_port:RegExp.$3
                ,port:RegExp.$4.length>0 ? parseInt(RegExp.$4) : (RegExp.$1==="http:" ? 80 : (RegExp.$1==="https:" ? 443 : -1))
                ,path:RegExp.$5
                ,file:RegExp.$6
                ,pathname:RegExp.$5+RegExp.$6
                ,search:RegExp.$7
                ,hash:RegExp.$8
                ,toString:new Function("return this.protocol+'//'+this.hostname+':'+this.port+this.path+this.file+this.search+this.hash;")
                };
      }
      return null;
   }
   $.fn.create=function(/*selector [,eventData] ,handler [,noExisting]*/) {
      if (arguments.length==1 && typeof(arguments[0])!=='string') {
         return createdElementIE(arguments[0]);
      }
      if (useBehaviors && !document.getElementById('jcade.create.htc')) {
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
      bindings.push({selector:selector,context:this,data:eventData,handler:handler,bindId:bindId});
      if (useBehaviors) {
         var added=false;
         if (false)
         {
            var unescapedSelector=selector.replace(/\\/g,"");
            for (var i=0;i<document.styleSheets.length && !added;i++)
            {
               var rules=document.styleSheets[i].rules;
               for (var j=0;j<rules.length && !added;j++)
               {
                  var rule=rules[j];
                  if (rule.selectorText===unescapedSelector)
                  {
                     rule.style.behavior="url("+$.fn.create.htcPath+"jcade.create.htc) "+rule.style.behavior;
                     added=true;
                  }
               }
            }
         }
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
      } else if (!useBehaviors) {
         $(function(){searchAndHandle(selector,self,eventData,handler,bindId);});
      }
      return this;
   };
   $.fn.create.htcPath=(function() {
      var path="";
      if (typeof(jQuery_fn_create_htcPath)==="string") {
         path=jQuery_fn_create_htcPath;
      } else {
         var scripts=document.getElementsByTagName('SCRIPT');
         for (var i=0;i<scripts.length;i++) {
            if (typeof(scripts[i].src)==='string' && scripts[i].src.search(/^(.*\b)jcade(\.min)?\.js(\?.*)?(#.*)?$/i)==0) {
               path=RegExp.$1;
               break;
            }
         }
      }
      var url=parseUrl(path);
      if (url && window.location.hostname.length>0 && url.hostname!==window.location.hostname) {
         path="/";
      }
      return path;
   })();
   $.fn.create.tagByClassName=function(elements,className) {
      return $.fn.create.tag(elements,"."+className.replace(/\./g,"\\."));
   };
   $.fn.create.tag=function(elements,selector) {
      elements=$(elements);
      elements.each(function(index,element){element[attr]=true;});
      for (var i=0;i<bindings.length;i++) {
         if (bindings[i] && bindings[i].selector===selector) {
            var a=attr+bindings[i].bindId;
            elements.each(function(index,element){element[a]=true;});
         }
      }
   };
})( jQuery );
(function($) {
   var useBehaviors=($.browser.msie && $.browser.version<9);
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
      if (useBehaviors) {
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
                            invoker:new Function("arg1","arg2","factory","return new "+classPath+"(arg1,arg2);"),
                            reverseArgs:false,
                            options:null,
                            optionsName:"*:options",
                            optionsParser:new Function("options","element","factory","var b=options.search(/^\\w*{/),c=options.indexOf(':'),p=options.indexOf('(');if (b>=0 || (p>=0 && (c<0 || p<c)))return (new Function('return '+options+';'))();return (new Function('return {'+options+'};'))();"),
                            noExisting:false,
                            handler:function(event) {
                               var element=$(event.target);
                               var options=event.target.getAttribute(factory.optionsName.replace(/\*/g,factory.name)) || event.target.getAttribute(factory.optionsName.replace(/\*/g,factory.path));
                               if (typeof(options)==="string")
                                  options=factory.optionsParser(options,element,factory);
                               if (factory.options)
                                  options=$.extend({},factory.options,options);
                               factory.invoker(factory.reverseArgs ?  element : options,factory.reverseArgs ?  options : element,factory);
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
   if ($.isFunction($.fn.datepicker))
   {
      $.uiFactory( "jQuery.ui.datepicker",{invoker:new Function("options","element","element.datepicker(options)")});
   }
   if ($.isFunction($.widget) && $.isFunction($.widget.bridge))
   {
      var bridge=$.widget.bridge;
      $.widget.bridge=function(name,object){
         bridge.apply(this,arguments);
         $.uiFactory( "jQuery." + object.prototype.namespace + "." + name,{invoker:new Function("options","element","element."+name+"(options)")} );
      }
      for (var i in $.ui)
         if ($.isFunction($.ui[i]) && $.ui[i].toString().indexOf("this._createWidget")>0)
            $.uiFactory("jQuery.ui."+i,{invoker:new Function("options","element","element."+i+"(options);")});
   }
})( jQuery );
