'use strict';

/**
 * @ngdoc directive
 * @name testYoApp.directive:projD3Stats
 * @description
 * # projD3Stats
 */
angular.module('testYoApp')
  .directive('projD3Stats', ['demoData','$filter',function (demoData,$filter) {
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
		
		var x_group = d3.scale.ordinal().rangeRoundBands([0,w],0.1);
		var y = d3.scale.linear().range([h+margin.top,margin.top]);
		var xAxis = d3.svg.axis().scale(x_group).orient('bottom');
		var yAxis = d3.svg.axis().scale(y).orient('left').tickFormat(d3.format('.2s'));
		function update(day) {
			content.html('');
			console.log('DAY '+day,dlg.proj.days[day].total);
			var data = [{t:demoData.projectExpectedSchedule['d'+day].expected,k:'expected'},{t:dlg.proj.days[day].total,k:'actual'}];
			var expPlateCount = demoData.projectExpectedSchedule['d'+day].plates;
			var actPlateCount = dlg.proj.days[day].total.plateProcess.plates;
		
			var processedData = [];
			var maxY = 0;
/*
			var maxs = {
				connect:0,
				connectY:0,
				travel:0,
				travelY:0,
				placeAndRelease:0,
				placeAndReleaseY:0,
				travelTime:0,
				tavelTimeY:0,
			};
*/
			data.forEach(function(d){
				var fact = (d.k == 'actual' ? 1/(60*actPlateCount):1/(60*expPlateCount));
				var vals = d.t.plateProcess;
				var vc = vals.connect*fact;
				var vt = vals.travel*fact;
				var vp = vals.placeAndRelease*fact;
				var vtt = d.t.reaquire.travelTime*fact;
				var pd = {
					plate:{
						d:d.k,
						k:'plate',
						stack:[
							{y0:0,y1:(vc),k:'connect',d:d.k},
							{y0:vc,y1:(vc+vt),k:'travel',d:d.k},
							{y0:(vc+vt),y1:(vc+vt+vp),k:'placeAndRelease',d:d.k}
						],
					},
					reaquire:{
						d:d.k,
						k:'reaquire',
						stack:[
							{y0:0,y1:vtt,k:'travelTime',d:d.k},
						]
					},
				};
/*
				var st = pd.plate.stack[0];
				if (maxs.connect<(st.y1-st.y0)) {
					maxs.connect = (st.y1-st.y0);
					maxs.connectY = st.y1;
				}
				st = pd.plate.stack[1];
				if (maxs.travel<(st.y1-st.y0)) {
					maxs.travel = (st.y1-st.y0);
					maxs.travelY = st.y1;
				}
				st = pd.plate.stack[2];
				if (maxs.placeAndRelease<(st.y1-st.y0)) {
					maxs.placeAndRelease = (st.y1-st.y0);
					maxs.placeAndReleaseY = st.y1;
				}
				st = pd.reaquire.stack[0];
				if (maxs.travelTime<st.y1-st.y0) {
					maxs.travelTime = st.y1-st.y0;
					maxs.travelTimeY = st.y1;
				}
*/
				
	
				if (pd.plate.stack[2].y1 > maxY) {
					maxY = pd.plate.stack[2].y1;
				}
				if (pd.reaquire.stack[0].y1 > maxY) {
					maxY = pd.reaquire.stack[0].y1;
				}
	
				processedData.push(pd.plate);
				processedData.push(pd.reaquire);
			});
			//maxY = maxY/60;
			x_group.domain(['plate','reaquire']);
			var x_comp = d3.scale.ordinal().domain(['expected','actual']).rangeRoundBands([0,x_group.rangeBand()]);
			y.domain([0,maxY]);
			
			var color = {
				connect:['red','Connect'],
				travel:['green','Lift'],
				placeAndRelease:['blue','Place & Release'],
				travelTime:['orange','Reacquire'],
			};
	
			var xplane = content.append('svg:g')
			  .attr('class', 'x axis')
			  .attr('transform', 'translate(0,' + (h+margin.top) + ')')
			  .call(xAxis);
			
			content.append('svg:g')
			  .attr('class', 'y axis')
			  .call(yAxis)
			.append('text')
			  .attr('transform', 'rotate(-90)')
			  .attr('y', 6)
			  .attr('dy', '.71em')
			  .style('text-anchor', 'end')
			  .text('Time[min]');
			
			var event = content.selectAll('.event').data(processedData)
				.enter().append('svg:g')
					.classed('event',true)
					.attr('transform',function(d){return 'translate('+x_group(d.k)+',0)';});
			
			var b = event.selectAll('.bar').data(function(d){return d.stack;})
				.enter().append('g')
					.attr({
						class:'bar',
						transform:function(d){return 'translate(' + x_comp(d.d) + ','+y(d.y1)+')';},
					});
			b.append('rect')
				.attr({
						width:x_group.rangeBand()/4,
						height:function(d){return y(d.y0)-y(d.y1);},
						fill:function(d){return color[d.k][0];},
				});
			b.append('text')
				.attr({
					x:x_group.rangeBand()/8,
					y:function(d){return y(d.y0)-y(d.y1)-2;},
					'text-anchor':'middle',
					'font-size':function(d){return Math.min(15, y(d.y0)-y(d.y1)-2);},
				})
				.text(function(d){return ($filter('fixed2')(d.y1-d.y0))+'[min]';});
			
			event.append('text')
				.attr('x',function(d){return x_comp(d.d);})
				.attr('y',function(d){return y(d.stack[d.stack.length-1].y1)-5;})
				.text(function(d){return ''+d.d;});
			
			 var legend = content.selectAll(".legend")
			 .data(Object.keys(color))
			 .enter().append("g")
			 	.attr("class", "legend")
			 	.attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });
	
			legend.append("rect")
				.attr("x", w - 18)
				.attr("width", 18)
				.attr("height", 18)
				.style("fill", function(d){return color[d][0];});
			
			legend.append("text")
				.attr("x", w - 24)
				.attr("y", 9)
				.attr("dy", ".35em")
				.style("text-anchor", "end")
				.text(function(d) { return color[d][1]; });

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
