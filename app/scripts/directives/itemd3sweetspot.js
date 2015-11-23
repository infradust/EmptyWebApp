'use strict';

/**
 * @ngdoc directive
 * @name testYoApp.directive:itemD3Sweetspot
 * @description
 * # itemD3Sweetspot
 */
angular.module('testYoApp')
	.directive('itemD3Sweetspot', function () {
		return {
			template: '<div></div>',
			restrict: 'E',
			replace:true,
			scope:{dlg:'='},
			link: function postLink(scope, element, attrs) {
				var r = 256;
		        var dlg = scope.dlg;
		        var root = d3.select(element[0]);
				var svg = root.append('svg:svg').attr('viewBox','0 0 ' + r*2 + ' ' + r*2).attr('width','100%').attr('height','100%');
				var data = dlg.sweetspotData || {_order:[]};
				
				var colorScale = d3.scale.linear()
					.domain([1,0.66,0.33, 0])
					.range(["green","yellow", "orange","red"]);
				
				var vecs = data._order;
				var lData = [];
				for (var i = 0; i <vecs.length; ++i) {
					lData.push({
						d:data[vecs[i]],
						k:vecs[i],
					});
				}
				var vrange = d3.range(vecs.length);
				var oArcF = d3.scale.ordinal()
					.domain(vecs)
					.rangeBands([0,2*Math.PI],Math.PI/180);
				var rb = oArcF.rangeBand();
				var oArcS = d3.scale.ordinal()
					.domain(vecs)
					.rangePoints([0,2*Math.PI]);
					
				//console.log('RB',oArcS('Speed'),oArcF('Speed'));
				var oRad = d3.scale.linear()
					.domain([1,0])
					.range([32,r-32]);
				var arc = d3.svg.arc()
					.innerRadius(function(d){return 8;})
					.outerRadius(function(d){return oRad(d.d.g)})
					.startAngle(function(d){return oArcF(d.k);})
					.endAngle(function(d){return oArcF(d.k)+rb;});
					
				var content = svg.append('g').attr('transform','translate('+r+','+r+')');
				
				function update() {
					var vs = content.selectAll('.vec').data(lData,function(d){return d.k;});
					var es = vs.enter();
					es = es.append('svg:g').attr('class','vec');
					es.append('path')
						.attr('class','vec_path')
						.attr('fill-opacity',0.6).attr('id',function(d){return ''+d.k});
					es.append('text').append('textPath').attr('xlink:href',function(d){return '#'+d.k;}).attr("startOffset",function(d,i){return "20%";}).text(function(d){return d.k;});
					vs.selectAll('.vec_path').attr('d',arc).attr('fill',function(d){return colorScale(d.d.g);});
				}
				
				for (var k in data) {
					scope.$watch('dlg.sweetspotData.'+k+'.g',function(){
						update();
					});
				}
				
/*
				scope.$watch('dlg.$scope.sweetspotData',function(newData){
					update();
				},true);
*/
				
				scope.$watch('dlg.selected',function(newSelected){update();});
				
			},
		};
});
