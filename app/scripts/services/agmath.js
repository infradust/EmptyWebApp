'use strict';

/**
 * @ngdoc service
 * @name testYoApp.AGMath
 * @description
 * # AGMath
 * Service in the testYoApp.
 */
angular.module('testYoApp')
	.service('AGMath', function () {
		function polyline_to_nodes(polyline) {
			var res = [];
			var len = polyline.length;
			for(var i = 0; i < len; ++i) {
				var d = polyline[i];
				var n = {x:d[0],y:d[1]};
				res.push(n);
			}
			for(var i = 0; i < len; ++i) {
				var c = res[i];
				var p = res[((i-1)+len)%len];//modulo "bug" in javascript for negative numbers
				var n = res[(i+1)%len];
				c.p1=p;
				c.p2=n;
			}
			return res;
		}
		
		function polypoint_to_nodes(polypoints) {
			var res = [];
			var len = polypoints.length;
			for(var i = 0; i < len; ++i) {
				var d = polypoints[i];
				var n = {x:d.x,y:d.y,key:i};
				res.push(n);
			}
			for(var i = 0; i < len; ++i) {
				var c = res[i];
				var p = res[((i-1)+len)%len];//modulo "bug" in javascript for negative numbers
				var n = res[(i+1)%len];
				c.p1=p;
				c.p2=n;
			}
			return res;
		}
		
		function z_rotate_nodes(points,angle,center) {
			center = center || [0,0]
			var cosAng = Math.cos(angle);
			var sinAng = Math.sin(angle);
			points.forEach(function(d){
				var x = d.x - center[0];
				var y = d.y - center[1];
				var nx = x*cosAng - y*sinAng;
				var ny = x*sinAng + y*cosAng;
				d.x = nx;
				d.y = ny;
			});
		}

		function facing_frame_x_proj(polyline) {
			var vis = [];
			var res = [];
			var min,max;
			min=max=polyline[0];
			polyline.forEach(function(d){
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
			for (var node = min; node !== max; node=next) {
				res.push(node);
				next = (node.p1 === prev ? node.p2 : node.p1);
				prev = node;
			}
			res.push(max);
			
			return res;
		}
		
		function visible_nodes_x_proj_facing_frame(frame) {
			var res = [];
			for (var i = 0; i <frame.length; ++i) {
				var e = frame[i];
				var busted = false;
				for (var j = 0; j < i && !busted; ++j) {
					var p = frame[j];
					if (p.x > e.x && p.y > e.y) {
						busted = true;
					}
				}
				for (var j = i+i; j < frame.length && !busted; ++j) {
					var p = frame[j];
					if (p.x > e.x && p.y < e.y) {
						busted = true;
					}
				}
				if (!busted) {
					res.push(e);
				}
			}
			return res;
		}
		
		function nodes_infront_of_visible_x_proj_facing_frame(frame,nodes,key) {
			nodes.forEach(function(n){
				if (n.y < frame[0].y || n.y > frame[frame.length-1].y) {
					n[key] = true;
				} else {
					for (var i =0; i <frame.length-1; ++i) {
						var p1 = frame[i];
						var p2 = frame[i+1];
						if (n.y >= p1.y && n.y <= p2.y) {
							if (n.x > p1.x && n.x > p2.x) {
								n[key] = true;
								i = frame.length;
							} else if (n.x < p1.x && n.x < p2.x) {
								n[key] = false;
								i = frame.length;
							}
						}
					}
				}
			});
		}
		
		function visible_frame_path(frame) {
			var res = [];
			frame.forEach(function(d){
				res.push([d.x,d.y]);
			});
			return res;
		}
		
		this.polylineToNodes = polyline_to_nodes;
		this.polypointToNodes = polypoint_to_nodes;
		this.zRotateNodes = z_rotate_nodes;
		this.facingFrameXProj = facing_frame_x_proj;
		this.visibleNodesXProjFacingFrame = visible_nodes_x_proj_facing_frame;
		this.visibleFramePath = visible_frame_path;
		this.nodesInfrontOfFacingFrameXProj = nodes_infront_of_visible_x_proj_facing_frame;
});
