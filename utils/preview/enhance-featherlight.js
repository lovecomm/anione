(function($) {
'use strict';
$(document).ready(function() {
	
	var featherlight = {
		content: $(".featherlight-content"),
		init : function() {
			var that = this;

			$(".banner").on("click", function() {
				that.links = $(this).closest("ul").find(".banner");
				that.linkClicked = $(this);
				that.currentLink = $(this).attr("href");
				that.close = $(".featherlight-close-icon");
				that.next = $(".featherlight-next");
				that.prev = $(".featherlight-previous");

				if( !that.linkClicked.hasClass("html5") ) {
					that.attachToBody = [that.close, that.prev, that.next];
				} else {
					that.attachToBody = [that.close];
				}
				that.moveEls();

				$(that.close).on("click", function() { that.reset(); })
				
				setTimeout(function() {
					$(".featherlight").on("click", function(e) { 
						that.reset();
					});
					$(".featherlight-inner").on("click", function(e) { 
						e.preventDefault();
						e.stopPropagation();
					});
				}, 300);
				$(that.next).on("click", function() { that.nextSlide(1); })
				$(that.prev).on("click", function() { that.nextSlide(0); })
			});
		},
		moveEls : function() {
			for( var i = 0; i <= this.attachToBody.length; i++ ) {
				var el = $(this.attachToBody[i]).detach();
				el.addClass("reattached");
				$("body").append(el);
			}
		},
		nextSlide : function(direction) {
			var container = $(".featherlight-content");
			var that = this;
			var new_index = that.findNextLink(direction);
			var new_img = that.links[new_index];
			var new_href = $(new_img).attr("href");

			if( new_index !== undefined ) {
				container.animate({
					opacity: 0
				}, 600, function() {
					container.find("img").attr("src", new_href);
				}).animate({
						opacity: 1
					}, 600);;
			}
			
		},
		findNextLink : function(direction) {
			var currentIndex;
			var endOfTheLine = true;
			var amountOfLinks = this.links.length - 1;

			for( var i = 0; i <= amountOfLinks; i++ ) {
				var link = $(this.links[i]);
				var href = link.attr("href");

				if( href !== undefined && href == this.currentLink) {
					currentIndex = i;
				}
			}

			if( (direction === 0 && currentIndex !== 0) || (direction === 1 && currentIndex < amountOfLinks) ) {
				endOfTheLine = false;
			} 

			if(!endOfTheLine) {
				// TEST IF IT'S THE FIRST OR LAST INDEX
				if( direction === 0 ) {
					// RETURN PREVIOUS LINK, UPDATE CURRENT LINK
					currentIndex -= 1;
					var updateded_index = $(this.links[currentIndex]);
					this.currentLink = updateded_index.attr("href");
					return currentIndex;
				} else if ( direction === 1 ) {
					// RETURN NEXT LINK, UPDATE CURRENT LINK
					currentIndex += 1
					var updateded_index = $(this.links[currentIndex]);
					this.currentLink = updateded_index.attr("href");
					return currentIndex;
				}
			}
		},
		reset : function() {
			// remove nav and close button
			for( var i = 0; i <= this.attachToBody.length; i++ ) {
				var el = $(this.attachToBody[i]).remove();
			}
			// remove featherlight content
			$(".featherlight").remove();

		}
	};
	featherlight.init();

});
})(jQuery);