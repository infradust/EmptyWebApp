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
        	attrs = attrs || {};
	        var d = defs.append(kind).attr('id',id).attr(attrs);
	        var s = setup || angular.noop;
	        s(d);
        }

		addDef('symbol','building',{viewBox:'0 0 512 512'},function(s){
			s.append('path')
				.attr('d',"M480,480V192H256V0H32v480H0v32h512v-32H480z M64,32h64v64H64V32z M64,128h64v64H64V128z M64,224h64v64H64V224z M64,320h64 v64H64V320z M192,480H96v-64h96V480z M224,384h-64v-64h64V384z M224,288h-64v-64h64V288z M224,192h-64v-64h64V192z M224,96h-64V32 h64V96z M288,224h64v64h-64V224z M288,320h64v64h-64V320z M416,480h-96v-64h96V480z M448,384h-64v-64h64V384z M448,288h-64v-64h64 V288z");
		});

		
		var addChild = d3Utils.graph.addChild;
		var link = d3Utils.graph.link;
		
		var D3Node = d3Utils.graph.d3node;
		var D3Link = d3Utils.graph.d3link;
		
		function node(backing,key) {
			var n =  new D3Node({backing:backing,key:key})
			n.setup = circleSetup;
			n.text = angular.noop;
			n.x = Math.random()*500;
			n.y = Math.random()*500;
			n.fixed = false;
			
			return n;
		} 
		
		var user = userService.user;
		var root = undefined;
		
		function circleSetup(s) {
			s.append('circle').attr('r',5);				
			if (this.text !== angular.noop) {			
				s.append('text')
					.attr('dy','.31em')
					.attr('text-anchor','end')
					.text(function(d){return d.text()});
			}
		}
		
		function rectSetup(s) {
			var rect = s.append('rect').attr({x:-10,y:-10});
			var w =20,h=20;
			if (this.text !== angular.noop) {			
				var t = s.append('text')
					.attr('dy','.31em')
					.attr('text-anchor','middle')
					.text(function(d){return d.text()});
				w = t.node().getComputedTextLength();
			}
			rect.attr('width',8+w+8).attr('height',h);
		}
		
		function prjSetup(s) {
			var rect = s.append('rect').attr('height',20);
			var t = s.append('text')
				.attr('dy','.31em')
				.attr('text-anchor','middle')
				.text(function(d){return d.$backing.name;});
			var w = 8 + t.node().getComputedTextLength() + 8;
			rect.attr('width',w).attr({x:-w/2,y:-10});
		}
		
		var nodes,links;
		function makeTree() {
			var n;
			
			root = node(user,'_');
			root.fixed = true;
			root.x = 400;
			root.y = 200;
			root.expanded = true;
			root.setup = function(s) {
				s.append('image').attr('x',-50).attr('y',-50).attr('width',100).attr('height',100).attr('xlink:href','images/User-unknown.svg');
			}
			
			var RACI = addChild(root,node(user.RACI,'RACI'));
			RACI.setup = function(s){
				s.append('rect').attr('width',40).attr('height',20).attr('x',-20).attr('y',-10);
				s.append('text')
					.attr('dy','.31em')
					.attr('text-anchor','middle')
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
			n.setup = function(s){
				s.append('use').attr({'xlink:href':'#building',width:30,height:30,x:-15,y:-30});
				s.append('text')
					.attr('dy',-30)
					.attr('text-anchor','middle')
					.text('Projects');
			};
			n.text = function(){return 'Projects';};
			console.log('Projects:',user.projects.length);
			for (var i = 0; i < user.projects.length; ++i) {
				var prj = user.projects[i];
				prj = addChild(n,node(prj,n.$key +':'+prj.__));
				prj.setup = prjSetup;
				//prj.text = function(){return prj.name;};
			}

			n = addChild(root,node(undefined,'???'));
			
			n = addChild(root,node(undefined,'___'));
		}
		
		makeTree();
		
		var force = d3.layout.force()
			.size([svgObj.width,svgObj.height])
			.charge(-400)
			.linkDistance(80)
			.gravity(0)
			.on('tick',tick);
		console.log(force.drag);
		//force.drag.on('dragend',function(){d3.event.sourceEvent.stopPropagation();});
		
		function tick() {
			lel.attr("x1", function(d) { return d.source.x; })
				.attr("y1", function(d) { return d.source.y; })
				.attr("x2", function(d) { return d.target.x; })
				.attr("y2", function(d) { return d.target.y; });
		
			nel.attr('transform',function(d){return 'translate('+d.x+','+d.y+')';});

		}

		
		var lel = content.selectAll('.link');
		var nel = content.selectAll('.node');
		
		function unfixChildren(n) {
			if (n.expanded) {
				for (var i = 0; i< n.children.length; ++i) {
					var c = n.children[i];
					c.fixed = c.expanded;
					unfixChildren(c);
				}
			}
		}
		
		function update() {
			force.stop();
			nodes = root.reachableNodes();
			links = root.reachableLinks();
			
			lel = lel.data(links,D3Link.id);
			lel.exit().remove();
			lel.enter().insert('line','.node').classed('link',true);
			
			nel = nel.data(nodes,D3Node.id);
			nel.exit()
				.attr('opacity',1)
				.attr('fill-opacity',1)
				.transition()
					.duration(300)
					.attr('opacity',0)
					.attr('fill-opacity',0)
					.attr('transform',function(d){return 'translate('+d.parent.x +','+d.parent.y+')';})
					.remove();
			nel.enter().append('g')
				.classed('node',true)
				.each(function(d){d.setup(d3.select(this));})
				.call(force.drag)
				.on('click',function(d){
					if (d3.event.defaultPrevented) return;
					d3.event.stopPropagation();
					d.expanded = !d.expanded;
					d.fixed = d.expanded;
					unfixChildren(d);
					update();
				});
			force.nodes(nodes).links(links).start();
		}		
		update();
		
      }
    };
  }]);
