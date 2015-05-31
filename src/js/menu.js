/* 
 * copy of https://www.rtr.at/fileadmin/template/main/js/menu.js
 */

sfHover = function() {
	var sfEls = document.getElementById("nav").getElementsByTagName("LI");
	for (var i=0; i<sfEls.length; i++) {
		sfEls[i].onmouseover=function() {
			this.className+=" sfhover";
		}
		sfEls[i].onmouseout=function() {
			this.className=this.className.replace(new RegExp(" sfhover\\b"), "");
		}
	}
}
if (window.attachEvent) window.attachEvent("onload", sfHover);


/*	
 * jQuery mmenu v4.1.9
 * @requires jQuery 1.7.0 or later
 *
 * mmenu.frebsite.nl
 *	
 * Copyright (c) Fred Heusschen
 * www.frebsite.nl
 *
 * Dual licensed under the MIT and GPL licenses.
 * http://en.wikipedia.org/wiki/MIT_License
 * http://en.wikipedia.org/wiki/GNU_General_Public_License
 */
!function(e){function t(t,n,o){if("object"!=typeof t&&(t={}),o){if("boolean"!=typeof t.isMenu){var s=o.children();t.isMenu=1==s.length&&s.is(n.panelNodetype)}return t}if("object"!=typeof t.onClick&&(t.onClick={}),"undefined"!=typeof t.onClick.setLocationHref&&(e[a].deprecated("onClick.setLocationHref option","!onClick.preventDefault"),"boolean"==typeof t.onClick.setLocationHref&&(t.onClick.preventDefault=!t.onClick.setLocationHref)),t=e.extend(!0,{},e[a].defaults,t),e[a].useOverflowScrollingFallback()){switch(t.position){case"top":case"right":case"bottom":e[a].debug('position: "'+t.position+'" not supported when using the overflowScrolling-fallback.'),t.position="left"}switch(t.zposition){case"front":case"next":e[a].debug('z-position: "'+t.zposition+'" not supported when using the overflowScrolling-fallback.'),t.zposition="back"}}return t}function n(t){return"object"!=typeof t&&(t={}),"undefined"!=typeof t.panelNodeType&&(e[a].deprecated("panelNodeType configuration option","panelNodetype"),t.panelNodetype=t.panelNodeType),t=e.extend(!0,{},e[a].configuration,t),"string"!=typeof t.pageSelector&&(t.pageSelector="> "+t.pageNodetype),t}function o(){d.$wndw=e(window),d.$html=e("html"),d.$body=e("body"),d.$allMenus=e(),e.each([c,u,p],function(e,t){t.add=function(e){e=e.split(" ");for(var n in e)t[e[n]]=t.mm(e[n])}}),c.mm=function(e){return"mm-"+e},c.add("menu ismenu panel list subtitle selected label spacer current highest hidden page blocker modal background opened opening subopened subopen fullsubopen subclose nooverflowscrolling"),c.umm=function(e){return"mm-"==e.slice(0,3)&&(e=e.slice(3)),e},u.mm=function(e){return"mm-"+e},u.add("parent style scrollTop offetLeft"),p.mm=function(e){return e+".mm"},p.add("toggle open opening opened close closing closed update setPage setSelected transitionend webkitTransitionEnd touchstart touchend mousedown mouseup click keydown keyup resize"),e[a]._c=c,e[a]._d=u,e[a]._e=p,e[a].glbl=d,e[a].useOverflowScrollingFallback(h)}function s(t,n){if(t.hasClass(c.current))return!1;var o=e("."+c.panel,n),s=o.filter("."+c.current);return o.removeClass(c.highest).removeClass(c.current).not(t).not(s).addClass(c.hidden),t.hasClass(c.opened)?s.addClass(c.highest).removeClass(c.opened).removeClass(c.subopened):(t.addClass(c.highest),s.addClass(c.subopened)),t.removeClass(c.hidden).removeClass(c.subopened).addClass(c.current).addClass(c.opened),"open"}function i(){return d.$scrollTopNode||(0!=d.$html.scrollTop()?d.$scrollTopNode=d.$html:0!=d.$body.scrollTop()&&(d.$scrollTopNode=d.$body)),d.$scrollTopNode?d.$scrollTopNode.scrollTop():0}function l(e,t,n){var o=!1,s=function(){o||t.call(e[0]),o=!0};e.one(p.transitionend,s),e.one(p.webkitTransitionEnd,s),setTimeout(s,1.1*n)}var a="mmenu",r="4.1.9";if(!e[a]){var d={$wndw:null,$html:null,$body:null,$page:null,$blck:null,$allMenus:null,$scrollTopNode:null},c={},p={},u={},f=0;e[a]=function(e,t,n){return d.$allMenus=d.$allMenus.add(e),this.$menu=e,this.opts=t,this.conf=n,this.serialnr=f++,this._init(),this},e[a].prototype={open:function(){return this._openSetup(),this._openFinish(),"open"},_openSetup:function(){var e=i();this.$menu.addClass(c.current),d.$allMenus.not(this.$menu).trigger(p.close),d.$page.data(u.style,d.$page.attr("style")||"").data(u.scrollTop,e).data(u.offetLeft,d.$page.offset().left);var t=0;d.$wndw.off(p.resize).on(p.resize,function(e,n){if(n||d.$html.hasClass(c.opened)){var o=d.$wndw.width();o!=t&&(t=o,d.$page.width(o-d.$page.data(u.offetLeft)))}}).trigger(p.resize,[!0]),this.conf.preventTabbing&&d.$wndw.off(p.keydown).on(p.keydown,function(e){return 9==e.keyCode?(e.preventDefault(),!1):void 0}),this.opts.modal&&d.$html.addClass(c.modal),this.opts.moveBackground&&d.$html.addClass(c.background),"left"!=this.opts.position&&d.$html.addClass(c.mm(this.opts.position)),"back"!=this.opts.zposition&&d.$html.addClass(c.mm(this.opts.zposition)),this.opts.classes&&d.$html.addClass(this.opts.classes),d.$html.addClass(c.opened),this.$menu.addClass(c.opened),d.$page.scrollTop(e),this.$menu.scrollTop(0)},_openFinish:function(){var e=this;l(d.$page,function(){e.$menu.trigger(p.opened)},this.conf.transitionDuration),d.$html.addClass(c.opening),this.$menu.trigger(p.opening),window.scrollTo(0,1)},close:function(){var e=this;return l(d.$page,function(){e.$menu.removeClass(c.current).removeClass(c.opened),d.$html.removeClass(c.opened).removeClass(c.modal).removeClass(c.background).removeClass(c.mm(e.opts.position)).removeClass(c.mm(e.opts.zposition)),e.opts.classes&&d.$html.removeClass(e.opts.classes),d.$wndw.off(p.resize).off(p.keydown),d.$page.attr("style",d.$page.data(u.style)),d.$scrollTopNode&&d.$scrollTopNode.scrollTop(d.$page.data(u.scrollTop)),e.$menu.trigger(p.closed)},this.conf.transitionDuration),d.$html.removeClass(c.opening),this.$menu.trigger(p.closing),"close"},_init:function(){if(this.opts=t(this.opts,this.conf,this.$menu),this.direction=this.opts.slidingSubmenus?"horizontal":"vertical",this._initPage(d.$page),this._initMenu(),this._initBlocker(),this._initPanles(),this._initLinks(),this._initOpenClose(),this._bindCustomEvents(),e[a].addons)for(var n=0;n<e[a].addons.length;n++)"function"==typeof this["_addon_"+e[a].addons[n]]&&this["_addon_"+e[a].addons[n]]()},_bindCustomEvents:function(){var t=this;this.$menu.off(p.open+" "+p.close+" "+p.setPage+" "+p.update).on(p.open+" "+p.close+" "+p.setPage+" "+p.update,function(e){e.stopPropagation()}),this.$menu.on(p.open,function(n){return e(this).hasClass(c.current)?(n.stopImmediatePropagation(),!1):t.open()}).on(p.close,function(n){return e(this).hasClass(c.current)?t.close():(n.stopImmediatePropagation(),!1)}).on(p.setPage,function(e,n){t._initPage(n),t._initOpenClose()});var n=this.$menu.find(this.opts.isMenu&&"horizontal"!=this.direction?"ul, ol":"."+c.panel);n.off(p.toggle+" "+p.open+" "+p.close).on(p.toggle+" "+p.open+" "+p.close,function(e){e.stopPropagation()}),"horizontal"==this.direction?n.on(p.open,function(){return s(e(this),t.$menu)}):n.on(p.toggle,function(){var t=e(this);return t.triggerHandler(t.parent().hasClass(c.opened)?p.close:p.open)}).on(p.open,function(){return e(this).parent().addClass(c.opened),"open"}).on(p.close,function(){return e(this).parent().removeClass(c.opened),"close"})},_initBlocker:function(){var t=this;d.$blck||(d.$blck=e('<div id="'+c.blocker+'" />').css("opacity",0).appendTo(d.$body)),d.$blck.off(p.touchstart).on(p.touchstart,function(e){e.preventDefault(),e.stopPropagation(),d.$blck.trigger(p.mousedown)}).on(p.mousedown,function(e){e.preventDefault(),d.$html.hasClass(c.modal)||t.$menu.trigger(p.close)})},_initPage:function(t){t||(t=e(this.conf.pageSelector,d.$body),t.length>1&&(e[a].debug("Multiple nodes found for the page-node, all nodes are wrapped in one <"+this.conf.pageNodetype+">."),t=t.wrapAll("<"+this.conf.pageNodetype+" />").parent())),t.addClass(c.page),d.$page=t},_initMenu:function(){this.conf.clone&&(this.$menu=this.$menu.clone(!0),this.$menu.add(this.$menu.find("*")).filter("[id]").each(function(){e(this).attr("id",c.mm(e(this).attr("id")))})),this.$menu.contents().each(function(){3==e(this)[0].nodeType&&e(this).remove()}),this.$menu.prependTo("body").addClass(c.menu),this.$menu.addClass(c.mm(this.direction)),this.opts.classes&&this.$menu.addClass(this.opts.classes),this.opts.isMenu&&this.$menu.addClass(c.ismenu),"left"!=this.opts.position&&this.$menu.addClass(c.mm(this.opts.position)),"back"!=this.opts.zposition&&this.$menu.addClass(c.mm(this.opts.zposition))},_initPanles:function(){var t=this;this.__refactorClass(e("."+this.conf.listClass,this.$menu),"list"),this.opts.isMenu&&e("ul, ol",this.$menu).not(".mm-nolist").addClass(c.list);var n=e("."+c.list+" > li",this.$menu);this.__refactorClass(n.filter("."+this.conf.selectedClass),"selected"),this.__refactorClass(n.filter("."+this.conf.labelClass),"label"),this.__refactorClass(n.filter("."+this.conf.spacerClass),"spacer"),n.off(p.setSelected).on(p.setSelected,function(t,o){t.stopPropagation(),n.removeClass(c.selected),"boolean"!=typeof o&&(o=!0),o&&e(this).addClass(c.selected)}),this.__refactorClass(e("."+this.conf.panelClass,this.$menu),"panel"),this.$menu.children().filter(this.conf.panelNodetype).add(this.$menu.find("."+c.list).children().children().filter(this.conf.panelNodetype)).addClass(c.panel);var o=e("."+c.panel,this.$menu);o.each(function(n){var o=e(this),s=o.attr("id")||c.mm("m"+t.serialnr+"-p"+n);o.attr("id",s)}),o.find("."+c.panel).each(function(){var n=e(this),o=n.is("ul, ol")?n:n.find("ul ,ol").first(),s=n.parent(),i=s.find("> a, > span"),l=s.closest("."+c.panel);if(n.data(u.parent,s),s.parent().is("."+c.list)){var a=e('<a class="'+c.subopen+'" href="#'+n.attr("id")+'" />').insertBefore(i);i.is("a")||a.addClass(c.fullsubopen),"horizontal"==t.direction&&o.prepend('<li class="'+c.subtitle+'"><a class="'+c.subclose+'" href="#'+l.attr("id")+'">'+i.text()+"</a></li>")}});var s="horizontal"==this.direction?p.open:p.toggle;if(o.each(function(){var n=e(this),o=n.attr("id");e('a[href="#'+o+'"]',t.$menu).off(p.click).on(p.click,function(e){e.preventDefault(),n.trigger(s)})}),"horizontal"==this.direction){var i=e("."+c.list+" > li."+c.selected,this.$menu);i.add(i.parents("li")).parents("li").removeClass(c.selected).end().each(function(){var t=e(this),n=t.find("> ."+c.panel);n.length&&(t.parents("."+c.panel).addClass(c.subopened),n.addClass(c.opened))}).closest("."+c.panel).addClass(c.opened).parents("."+c.panel).addClass(c.subopened)}else e("li."+c.selected,this.$menu).addClass(c.opened).parents("."+c.selected).removeClass(c.selected);var l=o.filter("."+c.opened);l.length||(l=o.first()),l.addClass(c.opened).last().addClass(c.current),"horizontal"==this.direction&&o.find("."+c.panel).appendTo(this.$menu)},_initLinks:function(){var t=this;e("."+c.list+" > li > a",this.$menu).not("."+c.subopen).not("."+c.subclose).not('[rel="external"]').not('[target="_blank"]').off(p.click).on(p.click,function(n){var o=e(this),s=o.attr("href");t.__valueOrFn(t.opts.onClick.setSelected,o)&&o.parent().trigger(p.setSelected);var i=t.__valueOrFn(t.opts.onClick.preventDefault,o,"#"==s.slice(0,1));i&&n.preventDefault(),t.__valueOrFn(t.opts.onClick.blockUI,o,!i)&&d.$html.addClass(c.blocking),t.__valueOrFn(t.opts.onClick.close,o,i)&&t.$menu.triggerHandler(p.close)})},_initOpenClose:function(){var t=this,n=this.$menu.attr("id");n&&n.length&&(this.conf.clone&&(n=c.umm(n)),e('a[href="#'+n+'"]').off(p.click).on(p.click,function(e){e.preventDefault(),t.$menu.trigger(p.open)}));var n=d.$page.attr("id");n&&n.length&&e('a[href="#'+n+'"]').off(p.click).on(p.click,function(e){e.preventDefault(),t.$menu.trigger(p.close)})},__valueOrFn:function(e,t,n){return"function"==typeof e?e.call(t[0]):"undefined"==typeof e&&"undefined"!=typeof n?n:e},__refactorClass:function(e,t){e.removeClass(this.conf[t+"Class"]).addClass(c[t])}},e.fn[a]=function(s,i){return d.$wndw||o(),s=t(s,i),i=n(i),this.each(function(){var t=e(this);t.data(a)||t.data(a,new e[a](t,s,i))})},e[a].version=r,e[a].defaults={position:"left",zposition:"back",moveBackground:!0,slidingSubmenus:!0,modal:!1,classes:"",onClick:{setSelected:!0}},e[a].configuration={preventTabbing:!0,panelClass:"Panel",listClass:"List",selectedClass:"Selected",labelClass:"Label",spacerClass:"Spacer",pageNodetype:"div",panelNodetype:"ul, ol, div",transitionDuration:400},function(){var t=window.document,n=window.navigator.userAgent,o=(document.createElement("div").style,"ontouchstart"in t),s="WebkitOverflowScrolling"in t.documentElement.style,i=function(){return n.indexOf("Android")>=0?2.4>parseFloat(n.slice(n.indexOf("Android")+8)):!1}();e[a].support={touch:o,oldAndroidBrowser:i,overflowscrolling:function(){return o?s?!0:i?!1:!0:!0}()}}(),e[a].useOverflowScrollingFallback=function(e){return d.$html?("boolean"==typeof e&&d.$html[e?"addClass":"removeClass"](c.nooverflowscrolling),d.$html.hasClass(c.nooverflowscrolling)):(h=e,e)},e[a].debug=function(){},e[a].deprecated=function(e,t){"undefined"!=typeof console&&"undefined"!=typeof console.warn&&console.warn("MMENU: "+e+" is deprecated, use "+t+" instead.")};var h=!e[a].support.overflowscrolling}}(jQuery);
                    
$(document).ready(function() {
    //if website doesn't need menu --> don't display it
    //usage: add #noMMenu to the URL

    function getCookie(e){var t,n,r,i=document.cookie.split(";");for(t=0;t<i.length;t++){n=i[t].substr(0,i[t].indexOf("="));r=i[t].substr(i[t].indexOf("=")+1);n=n.replace(/^\s+|\s+$/g,"");if(n==e){return unescape(r)}}}function setCookie(e,t,n){var r=new Date;var i=r.getTime();i+=n*1e3;r.setTime(i);var s=escape(t)+(n==null?";":"; expires="+r.toUTCString()+";");document.cookie=e+"="+s+" path=/; secure"};
    if (getCookie("noMenu") === "noMenu") {
        return;
    }
    if (window.location.hash && window.location.hash.length > 0 && window.location.hash.indexOf("noMMenu") >= 0) {
        setCookie("noMenu","noMenu",60*60*24);
        return;
    }
    
    //add trigger
    $("header #netztestmenu").after('<div class="menu-trigger"><a href="#netztestmenu"></a></div>');
    
    $("#netztestmenu").mmenu({
        // options:
        header: true,
        searchfield: true,
        position: "left"
    }, {
        clone: true,
        selectedClass: 'selected'
    });
    
    //add link to homepage
    //$("#mm-netztestmenu ul").prepend("<li><a href='/'><strong>" + $("#netztestmenu").parent().children("a").first().html() + "</strong></a></li>");
});                    