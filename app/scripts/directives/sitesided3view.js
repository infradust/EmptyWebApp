'use strict';

/**
 * @ngdoc directive
 * @name testYoApp.directive:siteSideD3View
 * @description
 * # siteSideD3View
 */
angular.module('testYoApp')
	.directive('siteSideD3View', ['AGMath','d3Utils','demoData',function (AGMath,d3Utils,demoData) {
		return {
			template: '<div></div>',
			restrict: 'E',
			replace:true,
			scope:{dlg:'='},
			link: function postLink(scope, element, attrs) {
				
				var svgObj = d3Utils.baseSvg(element,1280,750);
				d3Utils.addZoomBaseView(svgObj,0.01,10);
				svgObj.svg.attr('width','100%').attr('height','100%');
				var dlg = scope.dlg;
				var project = dlg.project;
				
				var sliderAngleSpan = d3.scale.linear()
				    .domain([0, 360])
				    .range([0, svgObj.width])
				    .clamp(true);
				
				var brush = d3.svg.brush()
				    .x(sliderAngleSpan)
				    .extent([0, 0])
				    .on("brush", brushed);
				function brushed() {
					d3.event.sourceEvent.stopPropagation();
					//d3.event.stopPropagation();
					var value = brush.extent()[0];
					if (d3.event.sourceEvent) { // not a programmatic event
					    value = sliderAngleSpan.invert(d3.mouse(this)[0]);
					    brush.extent([value, value]);
					}

				    handle.attr("cx", sliderAngleSpan(value));
					currentAngle = value*Math.PI/180;
					update();
				}
				var ctrl = svgObj.ctrlGroup;
				
				ctrl.append("g")
				    .attr("class", "angle axis")
				    .attr("transform", "translate(0," + (svgObj.height-30) + ")")
				    .call(d3.svg.axis()
				      .scale(sliderAngleSpan)
				      .orient("bottom")
				      .tickFormat(function(d) { return d + "°"; })
				      .tickSize(0)
				      .tickPadding(12))
				  .select(".domain")
				  .select(function() { return this.parentNode.appendChild(this.cloneNode(true)); })
				    .attr("class", "halo");
				
				var slider = ctrl.append('g').attr('class','d3slider').attr('transform','translate(0,'+(svgObj.height-40)+')').call(brush);
				slider.selectAll(".extent,.resize").remove();
				slider.select('.background').attr('height',40);
				var handle = slider.append("circle")
				    .attr("class", "handle")
				    .attr("transform", "translate(0,10)")
				    .attr("r", 10);


				
				var content = svgObj.content;
						var liner = d3.svg.line()
						.x(function(d){return d.x;})
						.y(function(d){return d.y;})
						.interpolate('linear');

				var frameContent = content.append('g');
				var framePath = frameContent.append('path')//.attr('d',liner(vFrame)).attr('fill','none').attr('stroke','black').attr('stroke-width',1);
				var hView = frameContent.append('g').attr('transform','translate(300,0)');
				var startLine = hView.append('line').attr('x1',0).attr('y1',0).attr('x2',0).attr('y2',0).attr('stroke-width',1).attr('stroke','black');
				var curLine = hView.append('line').attr('x1',0).attr('y1',0).attr('x2',0).attr('y2',0).attr('stroke-width',1).attr('stroke','green');
				var endLine = hView.append('line').attr('x1',0).attr('y1',0).attr('x2',0).attr('y2',0).attr('stroke-width',0.4).attr('stroke','grey');
				
				var yFnc = d3.scale.linear();
				var currentAngle = 0;
				
				function craneBase(key) {
					var m = demoData.measurments[key].base_location.latest;
					return {x:m.x[0],y:m.y[0],z:m.z[0]};
				}
				
				function craneHookBlockHeight(key) {
					return demoData.measurments[key].hook_block_height.latest.d[0];
				}
				
				
				function craneRotation(key) {
					var r = demoData.measurments[key].rotation.latest.r[0]-currentAngle;
					var res = {x:0,y:0};
					if (r >= Math.PI/2 && r < Math.PI) {
						res.x = -Math.cos(Math.PI-r);
						res.y = Math.sin(r);
					} else if(r>= Math.PI && r < 3*Math.PI/4){
						res.x = -Math.cos(3*Math.PI/4-r);
						res.y = -Math.sin(3*Math.PI/4-r);
					} else if (r >= 3*Math.PI/4 && r < 2*Math.PI) {
						res.x = Math.cos(2*Math.PI - r);
						res.y = -Math.sin(2*Math.PI - r)
					} else {
						res.x = Math.cos(r);
						res.y = Math.sin(r);
					}
					return res;
				}
				
				function craneTrollyRadius(key) {
					return demoData.measurments[key].trolly_pos.latest.d[0];
				}
								
				function update() {
					var cranes = [];
					dlg.cranes.forEach(function(d){
						var b = craneBase(d.__);
						var r = craneRotation(d.__);
						var crane = {
							crn:d,
							x:b.x,
							y:b.y,
							r:r,
							h:d.height[0],
							key:d.__,
							b:b,
							fr:d.front_radius[0],
							rr:d.back_radius[0],
							hbh:craneHookBlockHeight(d.__),
							t:craneTrollyRadius(d.__),
							c:d.color,
							i:true,
						};
						cranes.push(crane);
					});
					var nodes = AGMath.polypointToNodes(dlg.frame);
					AGMath.zRotateNodes(nodes,currentAngle,[200,200]);
					AGMath.zRotateNodes(cranes,currentAngle,[200,200]);
					var vFrame = AGMath.facingFrameXProj(nodes);
					var vfp = AGMath.visibleNodesXProjFacingFrame(vFrame);
					//AGMath.nodesInfrontOfFacingFrameXProj(vfp,cranes,'i');
					
					yFnc.range([project.targetHeight[0],0]).domain([0,project.targetHeight[0]]);
					var yFnc0 = yFnc(0);
					var yFncTop = yFnc(project.targetHeight[0]);
					var yFncCur = yFnc(project.currentHeight[0]);
					
					var startX = -vfp[0].y;
					var endX = -vfp[vfp.length-1].y;
					
					
					framePath.attr('d',liner(vFrame)).attr('fill','none').attr('stroke','black').attr('stroke-width',1);
					startLine.attr('x1',startX).attr('y1',yFnc0).attr('x2',endX).attr('y2',yFnc0);
					curLine.attr('x1',startX).attr('y1',yFncCur).attr('x2',endX).attr('y2',yFncCur);
					endLine.attr('x1',startX).attr('y1',yFncTop).attr('x2',endX).attr('y2',yFncTop);
					
					var vLine=hView.selectAll('.frame_side_v_line').data(vfp,function(d){return d.key;});
					vLine.exit().remove();
					var newLines = vLine.enter().append('g').attr('class','frame_side_v_line');
					newLines.append('line').attr('class','left_line').attr('stroke','grey').attr('stroke-width',0.4);
					newLines.append('line').attr('class','done_line').attr('stroke','black').attr('stroke-width',1);
					
					vLine.select('.done_line').attr('x1',function(d){return -d.y;}).attr('y1',yFnc0).attr('x2',function(d){return -d.y;}).attr('y2',yFncCur);
					vLine.select('.left_line').attr('x1',function(d){return -d.y;}).attr('y1',yFncCur).attr('x2',function(d){return -d.y;}).attr('y2',yFncTop);
					
					var crs = hView.selectAll('.h_crane').data(cranes,function(d){return d.key;});
					crs.exit().remove();
					var ecrs = crs.enter().append('g').attr('class','h_crane');
					ecrs.append('line').attr('class','h_crane_base').attr('stroke',function(d){return d.c;}).attr('stroke-width',2);
					ecrs.append('line').attr('class','h_crane_fjib').attr('stroke',function(d){return d.c;}).attr('stroke-width',2);
					ecrs.append('line').attr('class','h_crane_rjib').attr('stroke',function(d){return d.c;}).attr('stroke-width',2);
					ecrs.append('line').attr('class','h_crane_cable').attr('stroke','black').attr('stroke-width',0.5);
					ecrs.append('circle').attr('class','h_crane_block').attr('fill',function(d){return d.c;}).attr('r',2);
										
					crs.select('.h_crane_base')
						.attr('x1',function(d){return -d.y;})
						.attr('y1',function(d){return d.i ? yFnc0 : yFncCur;})
						.attr('x2',function(d){return -d.y;})
						.attr('y2',function(d){return yFnc(d.h);});
					crs.select('.h_crane_fjib')
						.attr('x1',function(d){return -d.y;})
						.attr('y1',function(d){return yFnc(d.h);})
						.attr('x2',function(d){return -(d.r.y*d.fr+d.y);})
						.attr('y2',function(d){return yFnc(d.h);});
					crs.select('.h_crane_rjib')
						.attr('x1',function(d){return -d.y;})
						.attr('y1',function(d){return yFnc(d.h);})
						.attr('x2',function(d){return -(-d.r.y*d.rr+d.y);})
						.attr('y2',function(d){return yFnc(d.h);});
					
					crs.select('.h_crane_cable')
						.attr('x1',function(d){return -(d.t*d.r.y+d.y);})
						.attr('y1',function(d){return yFnc(d.h);})
						.attr('x2',function(d){return -(d.t*d.r.y+d.y);})
						.attr('y2',function(d){return yFnc(d.hbh);});
					
					crs.select('.h_crane_block')
						.attr('cx',function(d){return -(d.t*d.r.y+d.y);})
						.attr('cy',function(d){return yFnc(d.hbh);});
					crs.select('.bulb')
						.attr('cx',function(d){return -(d.t*d.r.y+d.y);})
						.attr('cy',function(d){return yFnc(d.hbh);});
				}
				
				scope.$watch('dlg.cranesChanged',function(value){
					if (dlg.cranesChanged === true) {
						update();
					}
					dlg.cranesChanged = false;
					
				});
				
				function pulse() {
					var vis = d3.select(this);
					vis.transition().duration(500).attr('r',15).transition().duration(500).attr('r',10).each('end',function(d){if (d.state !== 0) pulse.call(this);});
				}

				
				scope.$watch('dlg.$scope.crane_state_changed',function(){
					var crane = hView.selectAll('.h_crane');
					crane.each(function(d,i){
						var vis = d3.select(this);
						if (d.crn.state === 0) {
							vis.select('.bulb').remove();
						} else {
							var bulb = vis.selectAll('.bulb').data([d]);
							bulb.enter().append('circle').attr({'class':'bulb',cy:0,r:10,'fill-opacity':0.5,fill:'red'}).transition().duration(500).each(pulse);
							//bulb.attr('cx',-(d.t*d.r.y+d.y)).attr('cy',yFnc(d.hbh));
						}
					});			

				});
				
				update();
				
				
				
			}
		};
}]);
