'use strict';

/**
 * @ngdoc directive
 * @name testYoApp.directive:craneHeatMap
 * @description
 * # craneHeatMap
 */
angular.module('testYoApp')
	.directive('craneHeatMap',['d3Utils', function (d3Utils) {
		return {
			template: '',
			restrict: 'E',
			replace:true,
			scope:{dlg:'=',map:'='},
			link: function postLink(scope, element, attrs) {
				
				var dlg = scope.dlg;
				var w=400,h=400;
				var svgObj = d3Utils.baseSvg(element,w,h);
				var content = svgObj.content;

				var rng = d3.range(parseInt('70',16),255);
				var heatColorMove = d3.scale.quantize().range(rng);
				var heatColorLift = d3.scale.quantize().range(rng);
				var heatColorLower = d3.scale.quantize().range(rng);
				
				var heatMap,mw,gridSize,data,vM,vL,vO;

				function reset() {
					content.html('');
					heatMap = scope.map;
					if (heatMap !== undefined) {
						mw = heatMap.w;
						gridSize = Math.floor(w/mw);
						data = d3.range(mw*mw);
						vM = heatMap.move.values;
						vL = heatMap.lift.values;
						vO = heatMap.lower.values;
						update();
					}
				}				
				
				function color(v,m) {
					if (v === 0) {
						return '00';
					}
					return m(v).toString(16);
				}
				
				function fill(d) {
					var m = color(vM[d],heatColorMove);//(vM[d]).toString(16);
					var l = color(vL[d],heatColorLift);//heatColorLift(vL[d]).toString(16);
					var o = color(vO[d],heatColorLower);//heatColorLower(vO[d]).toString(16);
					return '#'+l+o+m;
				}
				
				function update() {
					if (heatMap === undefined) {
						return;
					}
					heatColorMove.domain([0,heatMap.move.max()]);
					heatColorLift.domain([0,heatMap.lift.max()]);
					heatColorLower.domain([0,heatMap.lower.max()]);
					
					var rect = content.selectAll('rect').data(data,function(d){return d;});
					rect.enter().append('rect')
						.attr({
							x:function(d,i){return Math.floor(i/mw)*gridSize;},
							y:function(d,i){return ((i%mw))*gridSize;},
							width:gridSize,
							height:gridSize,
							stroke:'none',
						});
					rect.attr('fill',fill);
				}
				
				scope.$watch('dlg.mapUpdated',function(){
					update();
				});
				
				scope.$watch('map',function(){
					reset();					
				});
			}
		};
	}]);
