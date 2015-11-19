'use strict';

/**
 * @ngdoc directive
 * @name testYoApp.directive:projD3Stats
 * @description
 * # projD3Stats
 */
angular.module('testYoApp')
  .directive('projD3Stats', ['demoData',function (demoData) {
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
		
		var data = [{t:demoData.projectExpectedSchedule.d0.expected,k:'expected'},{t:dlg.proj.days[0].total,k:'actual'}];
		
		var x_group = d3.scale.ordinal().rangeRoundBands([0,w],0.1);
		var y = d3.scale.linear().range([h+margin.top,margin.top]);
		
		var xAxis = d3.svg.axis().scale(x_group).orient('bottom');
		var yAxis = d3.svg.axis().scale(y).orient('left').tickFormat(d3.format('.2s'));
		
		var processedData = [];
		var maxY = 0;
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
		data.forEach(function(d){
			var vals = d.t.plateProcess;
			var pd = {
				plate:{
					d:d.k,
					k:'plate',
					stack:[
						{y0:0,y1:(vals.connect)/60,k:'connect',d:d.k},
						{y0:(vals.connect)/60,y1:(vals.connect+vals.travel)/60,k:'travel',d:d.k},
						{y0:(vals.connect+vals.travel)/60,y1:(vals.connect+vals.travel+vals.placeAndRelease)/60,k:'placeAndRelease',d:d.k}
					],
				},
				reaquire:{
					d:d.k,
					k:'reaquire',
					stack:[
						{y0:0,y1:d.t.reaquire.travelTime/60,k:'travelTime',d:d.k},
					]
				},
			};
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
			

			if ((vals.connect+vals.travel+vals.placeAndRelease) > maxY) {
				maxY = (vals.connect+vals.travel+vals.placeAndRelease);
			}
			if (d.t.reaquire.travelTime > maxY) {
				maxY = d.t.reaquire.travelTime;
			}

			processedData.push(pd.plate);
			processedData.push(pd.reaquire);
		});
//		maxY = maxs.connect+maxs.travel+maxs.placeAndRelease;
		maxY = maxY/60;
		x_group.domain(['plate','reaquire']);
		var x_comp = d3.scale.ordinal().domain(['expected','actual']).rangeRoundBands([0,x_group.rangeBand()]);
		y.domain([0,maxY]);
		
		console.log('y(0):',y(0),'y(maxY)',y(maxY));
		console.log('PDATA:',processedData[0].stack.map(function(d){return [y(d.y0),y(d.y1)];}));
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
			
		event.selectAll('rect').data(function(d){return d.stack;})
			.enter().append('rect')
				.attr('x',function(d){return x_comp(d.d);})
				.attr('width',x_group.rangeBand()/4)
				.attr('y',function(d){return y(d.y1);})
				.attr('height',function(d){return y(d.y0)-y(d.y1);})
				.attr('fill',function(d){return color[d.k][0];});
		
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
    };
}]);
