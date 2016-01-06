'use strict';

/**
 * @ngdoc directive
 * @name testYoApp.directive:d3KPI
 * @description
 * # d3KPI
 */
angular.module('testYoApp')
	.directive('d3KPI',['$compile','$window','d3Utils', function ($compile,$window,d3Utils) {
		return {
			template: '<g></g>',
			restrict: 'E',
			replace:true,
			scope:{lst:'=',root:'='},
			link: function postLink(scope, element, attrs) {
			
				scope.$on('kpi.change',function(event,data){
					update();	
				});
				var root;
				scope.$watch('root',function(){
					root = scope.root;
					update();
				});
				
				//var lst = scope.lst = scope.lst || [];
				var w = 300,h=150;
				var svgObj = d3Utils.baseSvg(element,w,h);
				
				var w = element[0].parentElement.offsetWidth;
				var h = element[0].parentElement.offsetHeight;
				var widthSpeed = w/3000;
				var kpis = svgObj.content.selectAll('.kpi');
				var path = [];
				var kpiRoot = svgObj.content.append('g')
							.data([root])
							.classed('kpiroot',true)
							.on('mouseenter',function(d){d3.select(this).select('rect').attr({stroke:'black','stroke-width':1});})
							.on('mouseleave',function(d){d3.select(this).select('rect').attr({stroke:'none','stroke-width':0});})
							.on('click',function(d){
								d3.event.stopPropagation();
								if (path.length) {
									root = path.pop();
									update();
								}
							});
				kpiRoot.append('rect').attr({width:0,fill:'white'});
				kpiRoot.append('text');
				
				var rects;
				console.log('W:H',w,h);
				var x = d3.scale.linear().domain([0,100]).range([1,w]);
				var y = d3.scale.ordinal();
				
				var gradeColor = d3.scale.linear()
					.domain([0,33,66,100])
					.range(["green","yellow", "orange","darkred"]);
				
/*
				function animWidthDur(d){
					return Math.abs(
							Math.floor(
								(x(d.grade) - d3.select(this).attr('width'))/widthSpeed
							)
					);
				}
*/
				function animWidthDur2(d){
					return Math.abs(
							Math.floor(
								(x(d.grade()) - d3.select(this).attr('width'))/widthSpeed
							)
					);
				}
				
				//scope.$watch('lst',update);
				
				var root;
				
				function rootHeight() {
					return Math.floor(h*2/(root.children.length+2));
				}
				
				function update() {
					if (root === undefined) {
						return;
					}
					var rh = rootHeight();
					y.domain(d3.range(root.children.length)).rangeRoundBands([rh+3,h],0.1);
					kpiRoot = kpiRoot.data([root]);
					kpiRoot.select('rect').attr('height',rh).transition().duration(animWidthDur2).attr('width',x(root.grade())).attr('fill',gradeColor(root.grade()));
					kpiRoot.select('text').attr('dy',8+rh/2).text(function(d){return d.desc;});
					
					
					//lst.sort(function(a,b){return b.grade - a.grade;});
					kpis = svgObj.content.selectAll('.kpi').data(root.children,function(d){return d.$key;});

					var ex = kpis.exit();
					ex.select('rect')
						.transition()
						.duration(100)
						.attr('width',0)
						.attr('fill','white');
					ex.transition().duration(100).remove();
						
					var e = kpis.enter()
						.append('g')
							.classed('kpi',true)
							.attr('transform',function(d,i){return 'translate(0,'+y(i)+')';})
							.on('mouseenter',function(d){d3.select(this).select('rect').attr({stroke:'black','stroke-width':1});})
							.on('mouseleave',function(d){d3.select(this).select('rect').attr({stroke:'none','stroke-width':0});})
							.on('click',function(d){
								d3.event.stopPropagation();
								if (d.children.length !== 0) {
									path.push(root);
									root = d;
									update();
								}
							});
					e.append('rect')
						.attr({width:x(0),height:y.rangeBand(),fill:gradeColor(0),stroke:'none'});
					e.append('text').attr({dy:8+y.rangeBand()/2}).text(function(d){return d.desc;});
								
					kpis.sort(function(a,b){return b.grade() - a.grade();});
					kpis.transition().duration(function(d,i){return 90*i;}).attr('transform',function(d,i){return 'translate(0,'+y(i)+')';});
					rects = kpis.select('rect').filter(function(d){return x(d.grade()) !== d3.select(this).attr('width');})							
						.transition()
						.duration(animWidthDur2)
						.attr('width',function(d){return x(d.grade());})
						.attr('height',y.rangeBand())
						.attr('fill',function(d){return gradeColor(d.grade());});

				}
			}
		};
}]);
