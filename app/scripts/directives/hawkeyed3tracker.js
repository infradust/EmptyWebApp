'use strict';

/**
 * @ngdoc directive
 * @name testYoApp.directive:hawkeyeD3Tranker
 * @description
 * # hawkeyeD3Tranker
 */
angular.module('testYoApp')
	.directive('hawkeyeD3Tracker',['d3Utils', function (d3Utils) {
		return {
			template: '<div></div>',
			restrict: 'E',
//			replace:true,
			scope:{dlg:'='},
			link: function postLink(scope, element, attrs) {
				var dlg = scope.dlg;
				console.log('DLG',dlg);
				var mapRoot = d3.select(element[0]).append('div').attr('class','het_map');
				var map = new google.maps.Map(mapRoot.node(), {
					zoom: 18,
					center: new google.maps.LatLng(31.868, 34.884),
					mapTypeId: google.maps.MapTypeId.TERRAIN
				});
				
				var data = [{lat:31.868,lon:34.884,key:'a'}];
				
				function distance(lat1, lon1, lat2, lon2) {
				  var p = 0.017453292519943295;    // Math.PI / 180
				  var c = Math.cos;
				  var a = 0.5 - c((lat2 - lat1) * p)/2 + 
				          c(lat1 * p) * c(lat2 * p) * 
				          (1 - c((lon2 - lon1) * p))/2;
				
				  return 12742 * Math.asin(Math.sqrt(a)); // 2 * R; R = 6371 km
				}
				
				var overlay = new google.maps.OverlayView();
				// Add the container when the overlay is added to the map.
				overlay.onAdd = function() {
					var layer = d3.select(this.getPanes().overlayLayer).append("div")
					    .attr("class", "hawkeye_overlay");
					// Draw each marker as a separate SVG element.
					// We could use a single SVG, but what size would it have?
					overlay.draw = function() {
					  var projection = this.getProjection(),
					      padding = 10;
					  var marker = layer.selectAll("svg")
					      .data(data,function(d){return d.key;})
					      .each(transform) // update existing markers
					    .enter().append("svg:svg")
					      .each(transform)
					      .attr("class", "he_marker");
					  // Add a circle.
					  marker.append("svg:circle")
					      .attr("r", 4.5)
					      .attr("cx", padding)
					      .attr("cy", padding);
					  // Add a label.
					  marker.append("svg:text")
					      .attr("x", padding + 7)
					      .attr("y", padding)
					      .attr("dy", ".31em")
					      .text(function(d) { return d.key; });
					  function transform(d) {
					    d = new google.maps.LatLng(d.lat, d.lon);
					    d = projection.fromLatLngToDivPixel(d);
					    return d3.select(this)
					        .style("left", (d.x - padding) + "px")
					        .style("top", (d.y - padding) + "px");
					  }
					};
					dlg.redraw = function (){
						var plat = data[0].lat;
						var plon = data[0].lon;
						data[0].lat = dlg.systems[''+1].lat;
						data[0].lon = dlg.systems[''+1].lon;
						
						console.log('LON:',data[0].lon,'LAT:',data[0].lat,'D:',distance(plat,plon,data[0].lat,data[0].lon)*1000);
						overlay.draw();
					};

				};
				overlay.onRemove = function(){};
				var mrkr = new google.maps.Marker({
					position:{lat:data[0].lat,lng:data[0].lon},
					map:map,
					label:'x',
				});
				
				overlay.setMap(map);
				
		}
	};
}]);
