

function ProgressBar(elementId, clickOverlayId, offsetContainerId, containerId, dragElementId, player) {
	this.elementId = elementId;
	this.offsetContainerId = offsetContainerId;
	this.containerId = containerId;
	this.dragElementId = dragElementId;
	this.clickOverlayId = clickOverlayId;
	this.player = player;
	var that = this;

	this.element = function () { return $('#'+this.elementId);}
	this.offsetContainer = function() { return $('#'+this.offsetContainerId); }
	this.container = function() { return $('#'+this.containerId);}
	this.dragElement = function() { return document.getElementById(this.dragElementId);}
	this.clickOverlay = function() { return $('#'+this.clickOverlayId); }


	function hideMenu () {
			var timer;
			var down = true;
		    $(document).mousemove(function() {
		    	var additionalContentBackgroundState = function() {return d3.select('#additionalContentBackground').style('display')};
		    	var displayBlock = 'block';
				var displayNone = 'none';
		        if (timer) {
		            window.clearTimeout(timer);            
		            timer = 0;
		        } 
		        if(down) { 
		            $('.videoControls').animate({bottom:'0'},'fast');
		           down = false;
		        }
		        timer = setTimeout(function() {
		        	if(additionalContentBackgroundState()==displayNone) {
		        		$('.videoControls').animate({bottom:'-150px'},'fast');
		        		down = true;
		        	}
		        }, 3000);

		    });
		};
	hideMenu();


	var progressBarWidth = function() { return that.element().width() - 40; }
	var timeAsPercent = function(time) { return time/ that.player.duration(); }
	var timePosition = function(time) { return timeAsPercent(time)*progressBarWidth() + 20; }
	var progressPosition = function() { return timePosition(that.player.currentTime()); }
	var bufferedPosition = function() { return timePosition(that.player.bufferedTime()); }
	var secondsPerPixel = function() { return that.player.duration()/progressBarWidth(); }
	var timeToPausePoint = function (pauseTime) { return pauseTime - that.player.currentTime(); }
	var pausePointVisible = function(d) { return timeToPausePoint(d.start) < 10*secondsPerPixel() ? 1 : 0; }
	var pageWrapperOffset = function() {return that.offsetContainer().offset(); }
	var eventTime = function (position) {return (position/progressBarWidth())*that.player.duration(); }
	var progressCirclePosition = function () {return d3.select(that.dragElement()).attr('cx') - 20; }

	that.clickOverlay().click(function(e) {
		var clickLocation = e.pageX - (pageWrapperOffset().left + 20);
		that.player.currentTime(eventTime(clickLocation));
		d3.select(that.dragElement()).transition().ease('linear').duration(250).attr('cx',progressPosition());
		d3.select('#completedLine').attr('width',progressCirclePosition());
	});


	var drag = d3.behavior.drag()
	        .on("drag", function() {
	        	that.player.pause();
	            d3.select(this).attr("cx", d3.event.x).style('cursor','pointer');
	        })
	        .on("dragend", function() {
	        	that.player.currentTime(eventTime(progressCirclePosition()));
	        	d3.select('#completedLine').attr('width',progressCirclePosition());
	        	that.player.play();
	        });


	var progressFunc = function () {
			var sliderWidthInSeconds = 10*secondsPerPixel();
			var pauseDiamonds = d3.select('.diamonds').selectAll('.pauseDiamond').data(diamondPoints);
			var diamondTransform = function(d) {return 'translate(' + (timePosition(d.start)) + ',17.5) rotate(-45)'};

			pauseDiamonds.enter().append('g').attr('transform',diamondTransform).attr('class','pauseDiamond').attr('title',function(d){return d.pointTitle}).append('rect').attr('x',-5).attr('y',-5).attr('width',10).attr('height',10);
			d3.select(that.dragElement()).transition().ease('linear').duration(250).attr('cx',progressPosition());
			pauseDiamonds.attr('transform', diamondTransform);
			// pauseDiamonds.select('rect').transition().duration(1000).style('opacity', pausePointVisible);
			pauseDiamonds.on('click',function(d){that.player.currentTime(d.start);});
			var now = that.player.currentTime();
			var end = that.player.duration();
			if (now>=end) {
				that.player.pause();
			}
			$('.pauseDiamond').tooltip({ position: { my: "center+8 bottom", at: "top" } });
			d3.select('#completedLine').attr('width',progressCirclePosition());
			//console.log(that.player.bufferStats());
			d3.select('#bufferedProgressLine').attr('width',bufferedPosition() - 20);
	}

	var bufferedFunc = function() {
		//console.log(that.player.bufferStats());
		d3.select('#bufferedProgressLine').attr('width',bufferedPosition() - 20);
	}


		
	d3.select(that.dragElement()).call(drag);

	window.setInterval(progressFunc, 250);

	$(window).resize(function() {
		progressFunc();
	});


}



