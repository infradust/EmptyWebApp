'use strict';

/**
 * @ngdoc directive
 * @name testYoApp.directive:projD3Demo
 * @description
 * # projD3Demo
 */
angular.module('testYoApp')
  .directive('projD3Demo', function () {
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
		
		
		var data = dlg.proj.days[0].events;
		data.forEach(function(d){
			var start = new Date();
			var end = new Date();
			start.setSeconds(start.getSeconds() + d.s);
			end.setSeconds(end.getSeconds() + d.f);
			if (d.t === 'plate') {
				
			}
			d.s = start;
			d.f = end;
		});
		y.domain(data.map(function(d) { return 'events'; }));
		x.domain([data[0].s,data[data.length-1].f]);// d3.extent(data, function(d) { return d.s; }));
		colorOf.domain(data.map(function(d) { return d.t; }));

		content.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + (margin.top) + ")")
			.call(xAxis);
		

		
		content.selectAll(".bar")
			.data(data)
			.enter().append("rect")
			  .attr("class", "bar")
			  .attr("y", function(d) { return margin.top+5; })
			  .attr("height", 50)
			  .attr("x", function(d) { return x(d.s); })
			  .attr("width", function(d) { return x(d.f)-x(d.s); })
			  .style("fill", function(d) { return colorOf(d.t); });
		
      }
    };
  });
