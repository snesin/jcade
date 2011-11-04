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
(function($) {
   var bindings=[],attr='jcade.create.tagged';
   function getEvent(target,currentTarget,data) {
      var event=jQuery.Event('create');
      event.srcElement=event.target=target;
      event.delegateTarget=event.currentTarget=currentTarget;
      event.data=data;
      return event;
   }
   function searchAndHandle(selector,context,eventData,handler) {
      var list=[];
      context.each(function(cIndex,cElement) {
         $(selector,cElement).each(function(index,element) {
            if(!element[attr]) {
               list.push(element);
               handler(getEvent(element,cElement,eventData));
            }
         })
      });
      for (var i=0;i<list.length;i++) {
         list[attr]=true;
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
                  bindings[i].handler(getEvent(element,c[j],bindings[i].data));
                  break;
               }
            }
         }
      }
      element[attr]=true;
   }
   $.fn.create=function(/*selector [,eventData] ,handler [,noExisting]*/) {
      if (arguments.length==1 && typeof(arguments[0])!='string') {
         return createdElementIE(arguments[0]);
      }
      if ($.browser.msie && !document.getElementById('jcade.create.htc')) {
         $('HEAD').append('<style id="jcade.create.htc">.jcade\\.destroy {behavior:url('+$.fn.create.htcPath+'jcade.destroy.htc)}</style>');
      }
      if (arguments.length==0) {
         return this;
      }
      var selector=arguments[0],eventData=null,handler,noExisting=false;
      if (arguments.length>2 && typeof(arguments[2])=='function') {
         eventData=arguments[1];
         handler=arguments[2];
         noExisting=arguments.length>3 && arguments[3];
      } else {
         handler=arguments[1];
         noExisting=arguments.length>2 && arguments[2];
      }
      if ($.browser.msie) {
         bindings.push({selector:selector,context:this,data:eventData,handler:handler});
         document.getElementById('jcade.create.htc').styleSheet.addRule(selector,'behavior:url('+$.fn.create.htcPath+'jcade.create.htc)',0);
      } else {
         var delayHandle=null;
         var self=this;
         this.bind('DOMNodeInserted.jcade.create',function() {
            if(!delayHandle) {
               delayHandle=window.setTimeout(function() {
                  delayHandle=null;
                  searchAndHandle(selector,self,eventData,handler);
               },1);
            }
         });
      }
      if (noExisting) {
         $(selector,this).each(function(index,e){e[attr]=true;});
      } else if ($.isReady) {
         searchAndHandle(selector,this,eventData,handler);
      } else if (!$.browser.msie) {
         $(function(){searchAndHandle(selector,self,eventData,handler);});
      }
      return this;
   };
   $.fn.create.htcPath=(function() {
      var scripts=document.getElementsByTagName('SCRIPT');
      for (var i=0;i<scripts.length;i++) {
         if (typeof(scripts[i].src)=='string' && scripts[i].src.search(/^(.*\b)jcade(\.min)?\.js(\?.*)?(#.*)?$/i)==0) {
            return RegExp.$1;
         }
      }
      return '';
   })();
})( jQuery );

(function($) {
   var bindings=[];
   function getEvent(target,data) {
      var event=jQuery.Event('destroy');
      event.currentTarget=event.target=target;
      event.data=data;
      return event;
   }
   function destroyedElementIE(element) {
      for (var i=0;i<bindings.length;i++) {
         if (bindings[i] && bindings[i].element===element) {
            bindings[i].handler(getEvent(element,bindings[i].data));
            bindings[i]=null;
         }
      }
      $(element).removeClass('jcade.destroy');
   }
   $.fn.destroy=function(/*[ eventData,] handler, namespace*/) {
      if (arguments.length==1 && typeof(arguments[0])!='function') {
         return destroyedElementIE(arguments[0]);
      }
      var eventData=null,handler,namespace=null;
      if (arguments.length>1 && typeof(arguments[1])=='function') {
         eventData=arguments[0];
         handler=arguments[1];
         if (arguments.length>2 && typeof(arguments[2])=='string' && arguments[2].length>0) {
            namespace=arguments[2];
         }
      } else {
         handler=arguments[0];
         if (arguments.length>1 && typeof(arguments[1])=='string' && arguments[1].length>0) {
            namespace=arguments[1];
         }
      }
      this.addClass('jcade.destroy');
      if ($.browser.msie) {
         $.fn.create();
         this.each(function(index,element){bindings.push({element:element,namespace:namespace,data:eventData,handler:handler});});
      } else {
         this.bind('DOMNodeRemoved.jcade'+(namespace ? '.'+namespace : ''),function(event) {
            $('.jcade\\.destroy',event.target).triggerHandler('DOMNodeRemoved');
            var e=$(event.target);
            if (e.hasClass('jcade.destroy')) {
               handler(getEvent(event.target,eventData));
            }
            e.removeClass('jcade.destroy');
         });
      }
      return this;
   };
})(jQuery);
