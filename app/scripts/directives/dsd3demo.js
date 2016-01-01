'use strict';

/**
 * @ngdoc directive
 * @name testYoApp.directive:dsd3demo
 * @description
 * # dsd3demo
 */

function polyline_to_nodes(polyline) {
	var res = [];
	var len = polyline.length;
	for(var i = 0; i < len; ++i) {
		var n = {x:d[0],y:d[1]};
		res.push(n);
	}
	for(var i = 0; i < len; ++i) {
		var c = res[i];
		var p = res[(i-1)%len];
		var n = res[(i+1)%len];
		c.p1=p;
		c.p2=n;
	}
	return res;
}

function z_rotation_points(points,angle) {
	var res = [];
	var cosAng = Math.cos(angle);
	var sinAng = Math.sin(angle);
	points.forEach(function(d){
		var n = {x:d.x*cosAng - d.y*sinAng,y:d.x*sinAng + d.y*cosAng};
		res.push(n);
	});
	return res;
}

function visible_frame_x_proj(polyline) {
	var res = [];
	var min=max=polyline[0];
	poliline.forEach(function(d){
		if (d.y>max.y) {
			max = d;
		}
		if (d.y < min.y) {
			min = d;
		}
	});
	var next = (min.p1.x > min.p2.x ? min.p1 : min.p2);
	res.push(min);
	var prev = min;
	min = next;
	for (node = min; node != max; node=next) {
		res.push(node);
		next = (node.p1 === prev ? node.p2 : node.p1);
		prev = node;
	}
	return res;
}

function visible_frame_path(frame) {
	var res = [];
	frame.forEach(function(d){
		res.push([d.x,d.y]);
	});
	return res;
}

function angleToPoint(x1,y1) {
	var p = NaN;
	if (x1 >= 0 && y1 >= 0) {
		p = (x1!==0 ? Math.atan(y1/x1) : Math.PI/2);
	} else if (x1 <= 0 && y1 >= 0) {
		p = (y1 !== 0 ? Math.atan((-x1)/y1)+(Math.PI/2) : Math.PI);
	} else if (x1 <= 0 && y1 <= 0) {
		p = (x1 !== 0 ? Math.atan(y1/x1)+Math.PI : 3*Math.PI/2);
	} else if (x1 >= 0 && y1 <= 0) {
		p = (y1 !== 0 ? Math.atan(x1/(-y1))+(3*Math.PI/2) : 0);
	}
	return p;
}

function circleCenteredIntersection(r0,r1,x1,y1) {
	var d2 = x1*x1 + y1*y1;
	var d = Math.sqrt(d2);
	var res;
	
	if (d > r0 + r1) { //circles have no intersection ==> too far
		res = undefined;
	} else if (d < r1){ //center is inside other circle
		res = {
			startAngle:0,
			endAngle:2*Math.PI,
		};
	} else if(d < r0) { //other circle is inside current circle
		res = pointCircleTangentArc(r1,x1,y1);
	} else /*if (r1 < d + r0 && r0 < d +r1)*/{
		var p = angleToPoint(x1,y1);		
		var r0_2 = r0*r0;
		var r1_2 = r1*r1;
		var c = (r1_2-r0_2+d2)/(2*d);
		var b2 = r1_2-c*c;
		var a2 = r0_2-b2;
		var diff = Math.atan(Math.sqrt(b2/a2));
		//console.log('b2',b2,'a2',a2,'d2',d2,'c2',c*c,'diff',diff);
		res = {
			startAngle:(p-diff),
			endAngle: (p+diff),
		};	
	}/* else {
		res = pointCircleTangentArc(r1,x1,y1);
	}*/
	return res;
}

function circleCenteredIntersection2(r0,r1,x1,y1) {
	var d2 = x1*x1 + y1*y1;
	var d = Math.sqrt(d2);
	var res;
	if (d > r0 + r1) {
		res = undefined;
	} else if (r1 < d + r0 && r0 < d +r1){
		var p = angleToPoint(x1,y1);		
		var r0_2 = r0*r0;
		var r1_2 = r1*r1;
		var c = (r1_2-r0_2+d2)/(2*d);
		var b2 = r1_2-c*c;
		var a2 = r0_2-b2;
		var diff = Math.atan(Math.sqrt(b2/a2));
		console.log('b2',b2,'a2',a2,'d2',d2,'c2',c*c,'diff',diff);
		res = {
			startAngle:(p-diff),
			endAngle: (p+diff),
		};	
	} else {
		res = pointCircleTangentArc(r1,x1,y1);
	}
	return res;
}

function timeToAngle(curr,angle,v) {
	var res = 0;
	if (v > 0 && alpha < curr) {
		res = 2*Math.PI+alpha-curr;
	} else if(v < 0 && curr < alpha) {
		res = 2*Math.PI+curr-alpha;
	} else {
		res= curr-alpha;
	}
	res = Math.abs(res/v);
	return res;
}

function timeToArc(curr,alpha,beta,v) {
	if (v === 0) {
		if (curr > alpha && curr < beta) {
			return NaN;
		}
		return undefined;
	}
	
	var talpha = 0;
	var tbeta = 0;
	if (curr > alpha && curr < beta) {
		if (v < 0) {
			beta = curr;
			talpha = timeToAngle(curr,alpha,v);
		} else {
			alpha = curr;
			tbeta = timeToAngle(curr,beta,v);
		}
	} else {
		talpha = timeToAngle(curr,alpha,v);
		tbeta = timeToAngle(curr,beta,v);
	}
	
	if (talpha > tbeta) {
		var tmp = talpha;
		talpha = tbeta;
		tbeta = tmp;
		tmp=alpha;
		alpha=beta;
		beta = tmp;
	}
	return {
		start:[talpha,alpha],
		finish:[tbeta,beta],
		t:tbeta-talpha,
	};
}

function segmentIntersection(s0,f0,s1,f1) {
	var res = undefined;
	if (s0 <= s1) {
		if (f0 >= f1) { //seg1 contains seg2
			return [s1,f1];
		} else if (f0 > s1) {//seg1 end intersect seg2 start
			return [s1,f0];
		}
	} else if (s1 < s0) {
		if (f1 >= f0) { //seg2 contains seg1
			return [s0,f0];
		} else if (f1 > s0) {//seg2 end intersect seg1 start
			return [s0,f1];
		}
	}
	return res;
}

function radiiIntersectionTime(a0,s0,f0,v0,a1,s2,f1,v1) {
	var t0 = timeToArc(a0,s0,f0,v0);
	var t1 = timeToArc(a1,s1,f1,v1);
}

function pointCircleTangentArc(r1,x1,y1) { 
	var d = Math.sqrt(x1*x1 + y1*y1);
	var res;
	if (d >= r1) {
		var alpha = Math.asin(Math.abs(r1/d));
		var p = angleToPoint(x1,y1);
		res = {
			startAngle:(p-alpha),
			endAngle:(p+alpha),
		};
	} else {
		res = {startAngle:0,endAngle:2*Math.PI};
	}
	return res;
}

angular.module('testYoApp')
  .directive('dsD3Demo', ['demoData','$interval','$rootScope',function (demoData,$interval,$rootScope) {
    return {
      template: '<div></div>',
      restrict: 'E',
      scope:{dlg:'='},
      replace:true,
      link: function postLink(scope, element, attrs) {
      	function nop(){};
      	var dlg = scope.dlg || {};
      	dlg.select = dlg.select || nop;
      	dlg.unselect = dlg.unselect || nop;
		var inventory = demoData.inventory;
		var measurments = demoData.measurments;
		var collisionTypes = demoData.collisionTypes;
		 
		var cranes = dlg.cranes;
		function compareByHeight(a,b) {
			var ah = a.height[0];
			var bh = b.height[0];
			return ah>bh ? 1 : bh > ah ? -1 : 0;
		}
		cranes.sort(compareByHeight);

		var intersections;
		
		function addIntersection(intersection,type,origin,target,ints) {
			if (intersection === undefined) {
				return;
			}
			intersection.origin = origin;
			intersection.target = target;
			intersection['type'] = collisionTypes[type];
			if (ints[type] === undefined) {
				ints[type] = {};
			}
			ints[type][target['__']] = intersection;
			//console.log('intersection:',origin['__'],'with',target['__'],'on:',intersection.startAngle*180/Math.PI,',',intersection.endAngle*180/Math.PI,'type:',type);		
		}
		
		function calcStaticIntersections() {
			intersections = {};
			for(var i = 0; i< cranes.length; ++i) {
				var crane = cranes[i];
				var key = crane['__'];
				var ints = intersections[key] = {};
				var p1 = measurments[key].base_location.latest;
				for (var j = 0; j < cranes.length; ++j) {
					if (i == j) continue;
					var other = cranes[j];
					var p2 = measurments[other['__']].base_location.latest;
					var intersection;
					var dx = p2.x[0]-p1.x[0];
					var dy = p2.y[0]-p1.y[0];
					//Front-Front
					intersection = circleCenteredIntersection(crane.front_radius[0],other.front_radius[0],dx,dy);
					addIntersection(intersection,'cf',crane,other,ints);
					
					//Front-Rear
					intersection = circleCenteredIntersection(crane.front_radius[0],other.back_radius[0],dx,dy);
					addIntersection(intersection,'cr',crane,other,ints);

					//Rear-Front
					intersection = circleCenteredIntersection(crane.back_radius[0],other.front_radius[0],dx,dy);
					addIntersection(intersection,'rc',crane,other,ints);
				}
			}
		}
		calcStaticIntersections();
		console.log('ints',intersections);
		d3.selection.prototype.moveToFront = function(_selection) {
			return this.each(function(){
				this.parentNode.appendChild(this);
			});
		 };
		 
		 function craneIcon(_selection) {
			_selection.append('line')
				.attr('x1',function(d){return (-d.back_radius[0]-(d.tower_radius[0]/2));})
				.attr('y1',0)
				.attr('x2',function(d){return -d.tower_radius[0]/2;})
				.attr('y2',0)
				.attr('stroke-width',function(d){return d.rear_width[0];})
				.attr('stroke','grey');
			_selection.append('line')
				.attr('x1',function(d){return -d.tower_radius[0]/2;})
				.attr('y1',0)
				.attr('x2',function(d){return d.tower_radius[0]/2;})
				.attr('y2',0)
				.attr('stroke-width',function(d){return d.tower_radius[0];})
				.attr('stroke','grey');
			_selection.append('line')
				.attr('x1',function(d){return d.tower_radius[0]/2;})
				.attr('y1',0)
				.attr('x2',function(d){return d.front_radius[0]+d.tower_radius[0]/2;})
				.attr('y2',0)
				.attr('stroke-width',function(d){return d.front_width[0];})
				.attr('stroke','grey');
				
			_selection.append('line')
				.attr('x1',function(d){return measurments[d['__']].trolly_pos.latest.d[0]-2.5;})
				.attr('y1',0)
				.attr('x2',function(d){return measurments[d['__']].trolly_pos.latest.d[0]+2.5;})
				.attr('y2',0)
				.attr('stroke-width',5)
				.attr('stroke','black')
				.classed('trolly',true);
			_selection.append('circle')
				.attr('cx',0)
				.attr('cy',0)
				.attr('r',4)
				.attr('fill',function(d){return d.color;});
		 }				
		 
		 function appendCraneRadius(_selection) {
		 	var gs = _selection.append('svg:g')
		 				.classed('radii',true);
		 	gs.append('circle')
				.classed('transparent',true)
				.attr('stroke-width',0.2)
				.attr('stroke','blue')
				.style('fill','none')
				.style('pointer-events','none')
				.attr('r',function(d){return d.front_radius[0];});
		 	gs.append('circle')
				.classed('transparent',true)
				.attr('stroke-width',0.2)
				.attr('stroke','blue')
				.style('fill','none')
				.style('pointer-events','none')
				.attr('r',function(d){return d.back_radius[0];});
		 }
		 
		 function removeCraneRadius(_selection) {
			 var s = _selection.selectAll('.radii');
			 s.remove();
		 }
		 
		 
		 function appendCraneBrake(_selection) {
			 var gs = _selection.append('svg:g')
			 	.classed('crane_brake',true);
			 gs.append('path').classed('unstopable',true).attr('fill','red').attr('fill-opacity',0.2);
			 gs.append('path').classed('warning',true).attr('fill','yellow').attr('fill-opacity',0.2);
			 
		 }
		 
		 function removeCraneBrake(_selection) {
			 _selection.selectAll('.crane_brake').remove();
		 }
		 
		 function updateCraneIcon(_selection) {
			 _selection.attr('transform',function(d){
											var m = measurments[d['__']];
											var p = m.base_location.latest;
											var r = m.rotation.latest;
											return 'translate('+p.x[0]+','+p.y[0]+')rotate('+(r.r[0]*180/Math.PI)+')';
										});
			_selection.selectAll('.trolly')
				.attr('x1',function(d){return measurments[d.__].trolly_pos.latest.d[0]-2.5;})
				.attr('y1',0)
				.attr('x2',function(d){return measurments[d.__].trolly_pos.latest.d[0]+2.5;})
				.attr('y2',0)
			
			var brake = _selection.selectAll('.crane_brake');
			var bArc = d3.svg.arc()
			 	.innerRadius(function(d){return d.front_radius[0]-10;})
			 	.outerRadius(function(d){return d.front_radius[0];})
			 	.startAngle(Math.PI/2)
			 	.endAngle(function(d){
			 		
			 		var m = measurments[d.__];
			 		var vr = m.slew_speed.latest.v;
			 		var tts = Math.abs(vr[0])/((d.break_speed[0]/30)*Math.PI);
			 		return tts*vr[0]+Math.PI/2;
			 	});
			 brake.selectAll('.unstopable').attr('d',function(d){return (measurments[d.__].slew_speed.latest.v[0] !== 0 ? bArc(d) : undefined);});
			 bArc
			 	.startAngle(function(d){
			 		var m = measurments[d.__];
			 		var vr = m.slew_speed.latest.v;
			 		var tts = Math.abs(vr[0])/((d.break_speed[0]/30)*Math.PI);
			 		return tts*vr[0]+Math.PI/2;
				})
				.endAngle(function(d){
			 		var m = measurments[d['__']];
			 		var vr = m.slew_speed.latest.v;
			 		var tts = Math.abs(vr[0])/((d.break_speed[0]/30)*Math.PI);
			 		return tts*vr[0]*(1.5)+Math.PI/2;
				});
			
			 brake.selectAll('.warning').attr('d',function(d){return (measurments[d.__].slew_speed.latest.v[0] !== 0 ? bArc(d) : undefined);});



		 }
		 
		 var drag = d3.behavior.drag()
		 				.origin(function(d){return d;})
		 				.on('drag',function(d){
			 				var m = measurments[d['__']].base_location.latest;
			 				m.x[0] += d3.event.dx;
			 				m.y[0] += d3.event.dy;
			 				$interval.cancel(interval);
			 				clearSelection();
			 				calcStaticIntersections();
			 				mouseEnterCrane.call(this,d);
			 				update(false);
		 				})
		 				.on('dragend',function(d){
			 				lastUpdateTime = performance.now()
			 				update(true);
		 				});
		 
		 function mouseEnterCrane(d){
				var s = d3.select(this);
				s.classed('selected',true);
				
				clearSelection();
				var sel = selectionEl;
				var m = measurments[d['__']];
				var p = m.base_location.latest;
				sel.attr('transform',function(){return 'translate('+p.x[0]+','+p.y[0]+')'});
				sel.append('circle')
					.attr('r',d.front_radius[0]+2)
					.attr('stroke-width',0.5)
					.attr('stroke','brown')
					.classed('param',true).classed('transparent',true);
				var ints = intersections[d['__']];
				var arc = d3.svg.arc()
						.innerRadius(function(d){
							var i = d[0];
							var ir = 0;
							switch(d[0].type['__']) {
								case 'cf':
									ir = i.origin.front_radius[0]+1;
									break;
								case 'cr':
									ir = i.origin.front_radius[0]-4;
									break;
								case 'rc':
									ir = i.origin.back_radius[0]+1;
									break;
								default:
									ir = 0;
									break;
							}
							return ir;
						 })
						.outerRadius(function(d){
							var i = d[0];
							var or = 0;
							switch(d[0].type['__']) {
								case 'cf':
									or = i.origin.front_radius[0]+4;
									break;
								case 'cr':
									or = i.origin.front_radius[0]-1;
									break;
								case 'rc':
									or = i.origin.back_radius[0]+4;
									break;
								default:
									or = 0;
									break;
							} 
							return or;							
						})
						.startAngle(function(d){ return d[0].startAngle+Math.PI/2;})
						.endAngle(function(d){return d[0].endAngle+Math.PI/2;});
				var data = [];
				for (var i in ints) {
					for(var j in ints[i]) {
						data.push([ints[i][j],''+i+':'+j]);							
					}
				}
				var arcs = sel.selectAll('.ints').data(data,function(d){return d[1];});
				arcs.enter().append('path').attr('d',arc).attr('fill',function(d){return d[0].target.color;}).classed('int_arc',true);
				
		}
		 
		var selectedCrane;
		var selectedCraneSel;
		 
		function unselectCrane() {
			if (selectedCrane !== undefined) {
				dlg.unselect(selectedCrane);
				selectedCrane = undefined;
			}
		}
		 
		function appendCraneIcon(_selection) {
			var gs = _selection.append('svg:g')
									.classed('crane',true)
									.call(drag);
			craneIcon(gs);
			gs.on('click',function(d){
				if (d3.event.defaultPrevented) return;
				unselectCrane();
				selectedCrane = d;
				dlg.select(d);
			});
			gs.on('mouseenter',mouseEnterCrane)
			  .on('mouseleave',function(d){
				var s = d3.select(this);
				s.classed('selected',false);
				clearSelection();
			});
		};
		 
		function clearSelection() {
			selectionEl.selectAll("*").remove();
			selectionEl.attr('transform',null);
		}
		 
		var root = d3.select(element[0]);
		var w = 1280;
		var h = 750;
		var svg = root.append('svg:svg').attr('viewBox','0 0 '+w+' '+h);
		svg.attr('width','100%').attr('height','100%');
		var ctrlGroup = svg.append('svg:g');
		ctrlGroup.append('rect')
			.attr('width',w)
			.attr('height',h)
			.style('fill','none')
			.style('stroke-width',1)
			.style('stroke','black')
			.style('pointer-events','all')
			.on('click',function(){
				if(d3.event.defaultPrevented) return;
				unselectCrane();
			});
		var content = svg.append('svg:g').attr('transform',function(){return 'translate(0,0)scale(1)';});
		var z = function() {
			content.attr('transform','translate('+d3.event.translate+')scale('+d3.event.scale+')');
		};
		var zoomer = d3.behavior.zoom()
			 .scaleExtent([0.001, 10])
			 .on("zoom", z);
		ctrlGroup.call(zoomer);
		
		var liner = d3.svg.line()
						.x(function(d){return d.x;})
						.y(function(d){return d.y;})
						.interpolate('linear');
		content.append('path')
			.attr('d',liner(dlg.frame)+'Z')
			.attr('fill','none')
			.attr('stroke-width',1)
			.attr('stroke','black');
		var selectionEl = content.append('svg:g').classed('selection',true);
		var craneDecor = content.append('svg:g').classed('crane_decor',true);
		var craneGroup = content.append('svg:g').classed('crane_group',true);
		
		var v = 0;
		var td = 0;
		var tr = 0;
		var vr = 0;
		 
		var motionInfo = dlg.motionInfo || {};
		
		 
		var interval;
		 
		function update(doInterval) {
		 var craneEls = craneGroup.selectAll('.crane').data(cranes,function(d){return d['__'];});
		 //var radaiEl = craneDecor.selectAll('.crane_radius').data(cranes,function(d){return d['__'];});
		 craneEls.exit().remove();
		 //radaiEl.exit().remove();			 
		 appendCraneIcon(craneEls.enter());
		 updateCraneIcon(craneEls);
		 if (doInterval === false || $rootScope.$state.current.name !== 'home') {
			 return;
		 }
		 interval = $interval(function(){
			 var currentTime = performance.now();
			 var diff = (currentTime - lastUpdateTime)/1000;
			 lastUpdateTime = currentTime;
			 dlg.cranesTick(diff);
			 update(true);
			 return;
			 for (var i = 0; i < cranes.length; ++i) {
			 	var key = cranes[i]['__'];
			 	var info = motionInfo[key];
				var d = measurments[key].trolly_pos.latest.d;
				if (d[0] > cranes[i].front_radius[0]) {
					d[0] = cranes[i].front_radius[0];
					info.v = -info.av;
				} else if (d[0] < 0) {
					d[0] = 0;
					info.v = info.av;
				}
				if (d[0] > info.td) {
					if (info.v > 0) {
						info.td = info.nextTD();
				 	}
					info.v = -info.av;
				} else {
				 	if (info.v < 0) {
					 	info.td = info.nextTD();
				 	}
					info.v = info.av;
				}
				d[0] = d[0] + info.v*diff;
			 
				d = measurments[key].rotation.latest.r;
				var m = measurments[key].slew_speed.latest;
				if (d[0] > info.tr) {
					if (m[0] > 0) {
				 		info.tr = info.nextTR();
					}
					m[0] = -info.avr;
				} else {
					if (m[0] < 0) {
				 		info.tr = info.nextTR();
					}
					m[0] = info.avr;
				}
				d[0] = d[0] + m[0]*diff;
				
			 }
			 
			 
			 update(true);
		 },100,1);
		}
		 
		var showingRadii = false;
		function toggleRadii(t) {
			var craneEls = craneGroup.selectAll('.crane');
			if (t && !showingRadii) {
				appendCraneRadius(craneEls);
			} else {
				removeCraneRadius(craneEls);	
			}
			showingRadii = t;
		}
		
		var showingBrake = false;
		function toggleBrake(t) {
			var craneEls = craneGroup.selectAll('.crane');
			if (t && !showingBrake) {
				appendCraneBrake(craneEls);
			} else {
				removeCraneBrake(craneEls);
			}
			showingBrake = t;
		}
		 
		scope.$watch('dlg.$scope.showRadii',function(show) {
			toggleRadii(dlg.$scope.showRadii);
		});
		scope.$watch('dlg.$scope.showBrake',function(show) {
			toggleBrake(dlg.$scope.showBrake);
		});
		
		function pulse() {
			var vis = d3.select(this);
			vis.transition().duration(500).attr('r',15).transition().duration(500).attr('r',10).each('end',function(d){if (d.state !== 0) pulse.call(this);});
		}
		
		scope.$watch('dlg.$scope.crane_state_changed',function(drop){
			var craneEls = craneGroup.selectAll('.crane');
			craneEls.each(function(d,i){
				var vis = d3.select(this);
				var tp = measurments[d.__].trolly_pos.latest.d[0];
				if (d.state === 0) {
					vis.select('.bulb').remove();
				} else {
					var bulb = vis.selectAll('.bulb').data([d]);
					bulb.enter().append('circle').attr({'class':'bulb',cy:0,r:10,'fill-opacity':0.5,fill:'red'}).transition().duration(500).each(pulse);
					bulb.attr('cx',tp);
				}
			});			
		});

		var lastUpdateTime = performance.now();
		update();
      }
    };
  }]);
