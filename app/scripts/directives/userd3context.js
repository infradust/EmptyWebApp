'use strict';

/**
 * @ngdoc directive
 * @name testYoApp.directive:userD3Context
 * @description
 * # userD3Context
 */


angular.module('testYoApp')
  .directive('userD3Context',['userService','d3Utils', function (userService,d3Utils) {
    return {
      template: '<div></div>',
      restrict: 'E',
      replace:true,
      scope:{dlg:'='},
      link: function postLink(scope, element, attrs) {
        var dlg = scope.dlg || {};
        
		var w = 1024;
		var h = 1024;
        
        var svgObj = d3Utils.baseSvg(element,w,h);
        d3Utils.addZoomBaseView(svgObj,0.001,10);
        
        
        var svg = svgObj.svg;
        var defs = svgObj.defs;
        var ctrlGroup = svgObj.ctrlGroup;
        var content = svgObj.content;
        
        function addDef(kind,id,attrs,setup) {
	        var d = defs.append(kind).attr('id',id);
	        for (var a in attrs) {
		        d.attr(a,attrs[a]);
	        }
	        var s = setup || angular.noop;
	        s(d);
        }
/*
        addDef('pattern','unknown_user',{x:0,y:0,width:749,height:860,patternUnits:'userSpaceOnUse'},function(d){
	        d.append('image').attr('x',0).attr('y',0).attr('width',749).attr('height',860).attr('xlink:href','images/User-unknown.svg');
	    });
*/

		
		var addChild = d3Utils.graph.addChild;
		var link = d3Utils.graph.link;
		
		function node(backing,key) {
			var n = d3Utils.graph.node(backing,key);
			n.setup = circleSetup;
			n.text = angular.noop;
			return n;
		} 
		
		var user = userService.user;
		var root = undefined;
		
		function circleSetup(s) {
			s.append('circle').attr('r',5);				
		}
		
		function rectSetup(s) {
			s.append('rect').attr('width',20).attr('height',20).attr('y',-10);
			if (this.text !== angular.noop) {			
				s.append('text')
					.attr('dy','.31em')
					.attr('text-anchor',function(d){return d.x < 180 ? 'start' : 'end';})
					.attr('transform',function(d){return d.x < 180 ? 'translate(8)' : 'rotate(180)translate(-8)';})
					.text(function(d){return d.text()});
			}
		}
		
		function makeTree() {
			var n;
			root = node(user,'_');
			root.setup = function(s) {
				s.append('image').attr('x',-50).attr('y',-50).attr('width',100).attr('height',100).attr('xlink:href','images/User-unknown.svg');
			}
			var RACI = addChild(root,node(user.RACI,'RACI'));
			RACI.setup = function(s){
				s.append('rect').attr('width',40).attr('height',20).attr('y',-10);
				s.append('text')
					.attr('dy','.31em')
					.attr('text-anchor',function(d){return d.x < 180 ? 'start' : 'end';})
					.attr('transform',function(d){return d.x < 180 ? 'translate(8)' : 'rotate(180)translate(-8)';})
					.text('RACI');
			}
			n = addChild(RACI,node(user.RACI.R,'R'));
			n.setup = rectSetup;
			n.text = function(){return 'R';};
			n = addChild(RACI,node(user.RACI.A,'A'));
			n.setup = rectSetup;
			n.text = function(){return 'A';};
			n = addChild(RACI,node(user.RACI.C,'C'));
			n.setup = rectSetup;
			n.text = function(){return 'C';};
			n = addChild(RACI,node(user.RACI.I,'I'));
			n.setup = rectSetup;
			n.text = function(){return 'I';};
			
			n = addChild(root,node(user.projects,'projects'));
			n.setup = circleSetup;

			n = addChild(root,node(undefined,'???'));
			n = addChild(root,node(undefined,'___'));
		}
		
		makeTree();
		
		var drag = d3.behavior.drag()
				.origin(function(d){return d;})
				.on('drag',function(d){					
					d.x += d3.event.dx;
					d.y += d3.event.dy;
					d.x = d3.event.x;
					d.y = d3.event.y;
					update();
				});

		
		var layout = d3.layout.tree()
			.size([360,470])
			.separation(function(a,b){return (a.parent === b.parent ? 1:2)/(a.depth);});
		
		var diagonal = d3.svg.diagonal.radial()
			.projection(function(d){return [d.y,d.x/180*Math.PI];});
			
		var nodes = layout.nodes(root);
		console.log('NODES:',nodes);
		var links = layout.links(nodes);       
            
		function update() {
			var link = content.selectAll('.link').data(links,function(d){return d.target.key;});
			link.enter()
				.insert('path','.node').attr('class','link');
			link.exit().remove();
			link.attr('d',diagonal);
			
			var node = content.selectAll('.node').data(nodes,function(d){return d.key;});
			node.enter().append('g').attr('class',function(d){d.setup(d3.select(this)); return 'node';}).call(drag);
			node.exit().remove();
			node.attr('transform',function(d){return 'rotate('+(d === root ? 0 :(d.x-90)) +')translate('+d.y+')';});
				
		}
		
		update();
      }
    };
  }]);
