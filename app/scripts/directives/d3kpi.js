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
			template: '',
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
				var w = element[0].parentElement.offsetWidth+300,
					h=element[0].parentElement.offsetHeight+100;
				var svgObj = d3Utils.baseSvg(element,w,h);
				svgObj.ctrlGroup.remove();
				
				//var w = element[0].parentElement.offsetWidth;
				//var h = element[0].parentElement.offsetHeight;
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
				var x = d3.scale.linear().domain([0,100]).range([1,w]);
				var y = d3.scale.ordinal();
				var gradeColor = d3.scale.linear()
					.domain([0,33,66,100])
					.range(["green","yellow", "orange","darkred"]);
				
				function animWidthDur2(d){
					return Math.abs(
							Math.floor(
								(x(d.grade()) - d3.select(this).attr('width'))/widthSpeed
							)
					);
				}
				
				var root;
				
				function rootHeight() {
					return Math.floor(h*1.5/(root.children.length+2));
				}
				
				function update() {
					if (root === undefined) {
						return;
					}
					var rh = rootHeight();
					y.domain(d3.range(root.children.length)).rangeRoundBands([rh,0.97*h],0.1);
					var ry = 0.8*rh;
					var ty = 0.8*y.rangeBand();
					var textU = {dy:ty,'font-size':ty};
					
					kpiRoot = kpiRoot.data([root]);
					kpiRoot.select('rect')
						.attr('height',rh)
						.transition()
						.duration(animWidthDur2)
						.attr('width',x(root.grade()))
						.attr('fill',gradeColor(root.grade()));
					var rr = kpiRoot.select('text').attr({dy:ry,'font-size':ry}).text(function(d){return d.desc;});
					rr.attr('font-size',function(d){ 
						var r = ry;
						if (w < this.getComputedTextLength()) {
							r = r*(w/this.getComputedTextLength());
						}
						return r;
						return Math.min(w,this.getComputedTextLength());
					});
					
					
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
					var tt = e.append('text').attr(textU).text(function(d){return d.desc;});
					tt.attr('font-size',function(d){ 
						var r = ty;
						if (w < this.getComputedTextLength()) {
							r = r*(w/this.getComputedTextLength());
						}
						return r;
					});
					
								
					kpis.sort(function(a,b){return b.grade() - a.grade();});
					kpis.transition().duration(function(d,i){return 90*i;}).attr('transform',function(d,i){return 'translate(0,'+y(i)+')';});
					kpis.select('rect').attr('height',y.rangeBand());
					var kpisF = kpis.filter(function(d){return x(d.grade()) !== d3.select(this).attr('width');});
					
					kpisF.select('rect')						
						.transition()
						.duration(animWidthDur2)
						.attr('width',function(d){return x(d.grade());})
						.attr('fill',function(d){return gradeColor(d.grade());});
					kpisF.select('text')
						.attr(textU);

				}
			}
		};
}]);
