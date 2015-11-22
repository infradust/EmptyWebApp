'use strict';

/**
 * @ngdoc directive
 * @name testYoApp.directive:projD3Demo
 * @description
 * # projD3Demo
 */
angular.module('testYoApp')
  .directive('projD3Demo', ['demoData',function (demoData) {
    return {
      template: '<div></div>',
      restrict: 'E',
      replace:true,
      scope:{dlg:'='},
      link: function postLink(scope, element, attrs) {
      	var dlg = scope.dlg;
		var root = d3.select(element[0]);
		var margin = {top:30,right:20,bottom:30,left:60};
		var w = 900;
		var h = 300;
		var w_margin = w+margin.left+margin.right;
		var h_margin = h+margin.top+margin.bottom;
		var svg = root.append('svg:svg').attr('viewBox','0 0 '+(w_margin)+' '+(h_margin)).attr('width','100%').attr('height','100%');
		var ctrlGroup = svg.append('svg:g');
		ctrlGroup.append('rect')
		.attr('width',w_margin)
		.attr('height',h_margin)
		.style('fill','none')
		.style('pointer-events','all');
		var content = svg.append('svg:g').attr('transform',function(){return 'translate(0,0)scale(1)';});
		var z = function() {
			content.attr('transform','translate('+d3.event.translate+')scale('+d3.event.scale+')');
		};
		var zoomer = d3.behavior.zoom()
			 .scaleExtent([0.001, 10])
			 .on("zoom", z);
		ctrlGroup.call(zoomer);
		
		var colorOf = d3.scale.category10();
    
		var y = d3.scale.ordinal()
		    .rangeRoundBands([10,h], 0.1);
		
		var x = d3.time.scale()
		    .range([5, w]);
		
		var yAxis = d3.svg.axis()
		    .scale(y)
		    .orient("left");
		    
		var xAxis = d3.svg.axis()
		    .scale(x)
		    .orient("top")
		    .tickFormat(d3.time.format("%Hh%Mm"));
		
		function update(day) {
			var data = dlg.proj.days[day].events;
			var processedData = [];
			data.forEach(function(d){
				var start = new Date();
				var end = new Date();
				start.setSeconds(start.getSeconds() + d.s);
				end.setSeconds(end.getSeconds() + d.f);
				if (d.t === 'plate') {
					
				}
				processedData.push({s:start,f:end,t:d.t,l:(d.f-d.s)});
			});
			data = processedData;
			y.domain(data.map(function(d) { return 'events'; }));
			x.domain([data[0].s,data[data.length-1].f]);// d3.extent(data, function(d) { return d.s; }));
			colorOf.domain(data.map(function(d) { return d.t; }));
	
			content.html('');
	
			content.append("g")
				.attr("class", "x_axis")
				.attr("transform", "translate(0," + (margin.top) + ")")
				.call(xAxis);
			
			var bars = content.selectAll(".bar")
				.data(data)
				.enter().append("g")
				  .attr("class", "bar")
				  .attr('transform',function(d){return 'translate('+x(d.s)+','+(margin.top+5)+')';})
				  .on('mouseenter',function(d){
					  var s = d3.select(this);
					  s.append('text').attr('y',100).text( function (f) {
						  var i = d.l | 0;
						  var m = Math.floor(i / 60);
						  var s = i-(m*60);
						  return m + ':' + s+'[min]';
					  });
				  })
				  .on('mouseleave',function(d){
					  var s = d3.select(this);
					  s.select('text').remove();
					  
				  });
			bars.append('rect')
				  .attr("height", 25)
				  .attr("width", function(d) { return x(d.f)-x(d.s); })
				  .style("fill", function(d) { return colorOf(d.t); });
			var ex = content.append('svg:g').attr('class','expected');
			console.log('DAY:',dlg.proj.days[day]);
			ex.append('text').attr('y',150).text('Expected:'+demoData.projectExpectedSchedule['d'+day].plates);
			ex.append('text').attr('y',170).text('Actual:'+dlg.proj.days[day].total.plateProcess.plates);
		}
		
		update(dlg.$scope.day);
					  
		scope.$watch('dlg.$scope.day',function(day){
			if (day !== undefined) {
				update(day);
			}
		});
		
		
		
      }
    };
  }]);
