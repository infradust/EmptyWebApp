'use strict';

/**
 * @ngdoc directive
 * @name testYoApp.directive:dsd3demo
 * @description
 * # dsd3demo
 */
 
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
	var d = Math.sqrt(x1*x1 + y1*y1);
	var res;
	if (d > r0 + r1) {
		res = undefined;
	} else if (r1 < d + r0 && r0 < d +r1){
		var p = angleToPoint(x1,y1);		
		var r0_2 = r0*r0;
		var r1_2 = r1*r1;
		var c = (r1_2-r0_2+d*d)/(2*d);
		var b2 = r1_2-c*c;
		var a2 = r0_2-b2;
		var diff = Math.atan(Math.sqrt(b2/a2));
		console.log('b2',b2,'a2',a2,'d2',d*d,'c2',c*c,'diff',diff);
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
	}
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
		 
		var cranes = [inventory['crane_01'],inventory['crane_02'],inventory['crane_03'],inventory['crane_04'],inventory['crane_05']];
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
			console.log('intersection:',origin['__'],'with',target['__'],'on:',intersection.startAngle*180/Math.PI,',',intersection.endAngle*180/Math.PI,'type:',type);		
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
		 
		 function updateCraneIcon(_selection) {
			 _selection.attr('transform',function(d){
											var m = measurments[d['__']];
											var p = m.base_location.latest;
											var r = m.rotation.latest;
											return 'translate('+p.x[0]+','+p.y[0]+')rotate('+(r.r[0]*180/Math.PI)+')';
										});
			_selection.selectAll('.trolly')
				.attr('x1',function(d){return measurments[d['__']].trolly_pos.latest.d[0]-2.5;})
				.attr('y1',0)
				.attr('x2',function(d){return measurments[d['__']].trolly_pos.latest.d[0]+2.5;})
				.attr('y2',0)
			var lines = _selection.selectAll('.dist_line');
			lines
				.attr('x1',function(d){return d[0][1].d[0];})
				.attr('y1',0)
				.attr('x2',function(d){var m = measurments[d[1]['__']]; return m.base_location.latest.x[0]-d[0][0].x[0]+m.trolly_pos.latest.d[0];})
				.attr('y2',function(d){return measurments[d[1]['__']].base_location.latest.y[0]-d[0][0].y[0];})
				.attr('stroke-width',2)
				.attr('stroke','black');


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
				selectedCraneSel.selectAll('.dist_line').remove();
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
				selectedCraneSel = d3.select(this);
				var others = [];
				var t_loc = measurments[d['__']].trolly_pos.latest;
				var loc = measurments[d['__']].base_location.latest
				for (var i = 0; i <cranes.length; ++i) {
					var other = cranes[i];
					if (d === other) continue;
					others.push([[loc,t_loc],other]);
				}
				var lines = selectedCraneSel.selectAll('.dist_line').data(others,function(d){return d[1]['__'];});
				lines.enter().append('line').classed('dist_line',true);
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
		var svg = root.append('svg:svg').attr('viewBox','0 0 900 900');
		var w = 900;
		var h = 900;
		var ctrlGroup = svg.append('svg:g');
		ctrlGroup.append('rect')
			.attr('width',900)
			.attr('height',900)
			.style('fill','none')
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
		var selectionEl = content.append('svg:g').classed('selection',true);
		var craneDecor = content.append('svg:g').classed('crane_decor',true);
		var craneGroup = content.append('svg:g').classed('crane_group',true);
		
		var v = 0;
		var td = 0;
		var tr = 0;
		var vr = 0;
		 
		var motionInfo = {};
		for (var i = 0; i < cranes.length; ++i) {
			var crane = cranes[i];
			var key = crane['__'];
			var info = {
				v:0,
				av:1,
				td:0,
				tr:0,
				vr:0,
				avr:(crane.max_slew_speed[0]/60)*2*Math.PI,
				nextTD:function(){
		 			return Math.random()*crane.front_radius[0];
		 		},
				nextTR:function() {
		 			return Math.random()*2*Math.PI;
		 		},
				};
			motionInfo[key] = info;
		}
		 
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
			 for (var i = 0; i < cranes.length; ++i) {
			 	var key = cranes[i]['__'];
			 	var info = motionInfo[key];
				var d = measurments[key].trolly_pos.latest.d;			 
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
				 if (d[0] > info.tr) {
				 	if (info.vr > 0) {
					 	info.tr = info.nextTR();
				 	}
					info.vr = -info.avr;
				 } else {
				 	if (info.vr < 0) {
					 	info.tr = info.nextTR();
				 	}
					info.vr = info.avr;
				 }
				 d[0] = d[0] + info.vr*diff;
				
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
		var lastUpdateTime = performance.now();
		update();
		 
		scope.$watch('dlg.$scope.showRadii',function(show) {
			toggleRadii(dlg.$scope.showRadii);
		});
      }
    };
  }]);
