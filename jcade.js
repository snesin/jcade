/*!
 * jcade v0.1
 * 
 * jQuery create and destroy events
 * 
 * Copyright 2011, Scott Nesin
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
*/
(function( $ ){
   var bound=false,bindings=[],attr='jcade.create.tagged';
   function searchAndHandle(selector,context,handler){
      $(selector,context).each(function(index,element){if(!element[attr]){element[attr]=true;handler($(element));}});
   }
   function createdElementIE(element)
   {
      if (element[attr])
         return false;
      element[attr]=true;
      var e=$(element);
      for (var i=0;i<bindings.length;i++)
         if (e.is(bindings[i].selector))
         {
            var c=bindings[i].context;
            for (var j=0;j<c.length;j++)
               if ($.contains(c[j],element))
               {
                  bindings[i].handler(e);
                  break;
               }
         }
   }
   $.fn.create=function(selector,handler,noExisting){
      if (arguments.length==1 && typeof(selector)!='string')
         return createdElementIE(selector);
      if ($.browser.msie && !bound)
      {
         $('HEAD').append('<style id="jcade.create.htc">.jcade\\.destroy {behavior:url('+$.fn.create.htcPath+'jcade.destroy.htc)}</style>');
         bound=true;
      }
      if (arguments.length==0)
         return this;
      if ($.browser.msie)
      {
         bindings.push({selector:selector,context:this,handler:handler});
         document.getElementById('jcade.create.htc').styleSheet.addRule(selector,'behavior:url('+$.fn.create.htcPath+'jcade.create.htc)');
      }
      else
      {
         var delayHandle=null;
         var self=this;
         this.bind('DOMNodeInserted.jcade.create',function()
         {
            if(!delayHandle)
               delayHandle=window.setTimeout(function()
               {
                  delayHandle=null;
                  searchAndHandle(selector,self,handler);
               },1);
         });
      }
      if (noExisting)
         $(selector,this).each(function(index,e){e[attr]=true;});
      else if ($.isReady)
         searchAndHandle(selector,this,handler);
      else if (!$.browser.msie)
         $(function(){searchAndHandle(selector,self,handler);});
      return this;
   };
   $.fn.create.htcPath=(function(){
      var scripts=document.getElementsByTagName("SCRIPT");
      for (var i=0;i<scripts.length;i++)
         if (typeof(scripts[i].src)=="string" &&
             scripts[i].src.search(/^(.*\b)jcade(\.min)?\.js$/i)==0)
            return RegExp.$1;
      return "";
   })();
})( jQuery );
/*
*/
(function( $ ){
   var bindings=[];
   function destroyedElementIE(element)
   {
      var e=$(element);
      for (var i=0;i<bindings.length;i++)
         if (bindings[i] && bindings[i].element===element)
         {
            bindings[i].handler(e);
            bindings[i]=null;
         }
      e.removeClass("jcade.destroy");
   }
   $.fn.destroy=function(handler,namespace){
      if (typeof(handler)!="function")
         return destroyedElementIE(handler);
      this.addClass("jcade.destroy");
      if ($.browser.msie)
      {
         $.fn.create();
         this.each(function(index,element){bindings.push({element:element,namespace:namespace ? namespace : null,handler:handler});});
      }
      else
         this.bind('DOMNodeRemoved.jcade'+(namespace ? '.'+namespace : ''),function(event){
            $(".jcade\\.destroy",event.target).triggerHandler("DOMNodeRemoved");
            var e=$(event.target);
            if (e.hasClass('jcade.destroy'))
               handler(e);
            e.removeClass("jcade.destroy");
         });
      return this;
   };
   /*
   $.fn.undestroy=function(namespace){
      var ns=namespace ? namespace : null;
      if ($.browser.msie)
         this.each(function(index,element){
            var any=false;
            for (var i=0;i<bindings.length;i++)
               if (bindings[i] && bindings[i].element===element)
                  if (ns==null || bindings[i].namespace==ns)
                     bindings[i]=null;
                  else
                     any=true;
            if (!any)
               $(element).removeClass("jcade.destroy");
         });
      else
         this.unbind('DOMNodeRemoved.jcade'+(ns ? '.'+ns : ''));
      return this;
   };
   */
})(jQuery);
