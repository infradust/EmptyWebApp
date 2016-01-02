'use strict';

/**
 * @ngdoc directive
 * @name testYoApp.directive:userD3Context
 * @description
 * # userD3Context
 */


angular.module('testYoApp')
  .directive('userD3Context',['userService','d3Utils','$state','d3Symbols', function (userService,d3Utils,$state,symbols) {
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

		addDef('symbol','building',{viewBox:symbols.building.viewBox},symbols.building);		
		addDef('symbol','team',{viewBox:symbols.team.viewBox},symbols.team);		
		addDef('symbol','health',{viewBox:symbols.health.viewBox},symbols.health);
		addDef('symbol','gauge',{viewBox:symbols.gauge.viewBox},symbols.gauge);		
		addDef('symbol','medreport',{viewBox:symbols.medreport.viewBox},symbols.medreport);		
		addDef('symbol','crane',{viewBox:symbols.crane_small.viewBox},symbols.crane_small);
		addDef('symbol','pin',{viewBox:symbols.pin_small.viewBox},symbols.pin_small);
		
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
			n.$vis = undefined;
			n.pinPoint = undefined;
			n.appendPin = function(){
				this.$vis.append('use').classed('node_pin',true).attr({'xlink:href':'#pin',width:10,height:10,opacity:1,x:this.pinPoint.x,y:this.pinPoint.y});
			};
			n.removePin = function(){
				this.$vis.select('.node_pin').transition().duration(300).attr('opacity',0).remove();
			};
			
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
			this.pinPoint = {x:-20,y:-20};
			rect.attr('width',8+w+8).attr('height',h);
		}
		
		function prjSetup(s) {
			var rect = s.append('rect').attr('height',20);
			var t = s.append('text')
				.attr('dy','.31em')
				.attr('text-anchor','middle')
				.text(function(d){return d.$backing.name;});
			var tl = 8 + t.node().getComputedTextLength();
			var w = tl + 15 + 2 + 15 + 8;
			var g;
			g = s.append('g')
				.attr('transform','translate('+ (w/2-17) + ','+ (-5) +')')
				.on('mouseenter',function(d){
					d3.select(this).select('use').style('fill','blue');
				})
				.on('mouseleave',function(d){
					d3.select(this).select('use').style('fill','darkgrey');
				});
			g.append('rect')
				.attr({width:15,height:15,stroke:'none','stroke-width':0})
				.style('fill','none')
				.style('pointer-events','all');
			g.append('use')
				.attr('xlink:href','#medreport')
				.attr('width',15)
				.attr('height',15)
				.style('fill','darkgrey');
				
			g = s.append('g')
				.attr('transform','translate('+ (w/2) + ','+ (-5) +')')
				.on('mouseenter',function(d){
					d3.select(this).select('use').style('fill','blue');
				})
				.on('mouseleave',function(d){
					d3.select(this).select('use').style('fill','darkgrey');
				})
				.on('click',function(d){
					$state.go('home');
				});
			g.append('rect')
				.attr({width:15,height:15,stroke:'none','stroke-width':0})
				.style('fill','none')
				.style('pointer-events','all');
			g.append('use')
				.attr('xlink:href','#crane')
				.attr('width',15)
				.attr('height',15)
				.style('fill','darkgrey');
			
			rect.attr('width',w).attr({x:-tl/2,y:-10});
			this.pinPoint = {x:rect.attr('x')-10,y:rect.attr('y')-10};
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
				this.pinPoint = {x:-60,y:-60};
				s.append('image').attr('x',-50).attr('y',-50).attr('width',100).attr('height',100).attr('xlink:href','images/User-unknown.svg');
			}
			
			var RACI = addChild(root,node(user.RACI,'RACI'));
			RACI.setup = function(s){
				this.pinPoint = {x:-30,y:-20};
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
				this.pinPoint = {x:-31,y:-31};
				s.append('circle').attr({fill:'white',r:21});
				s.append('use').attr({'xlink:href':'#building',width:30,height:30,x:-15,y:-15});
				s.append('text')
					.attr('dy',-17)
					.attr('text-anchor','middle')
					.text('Projects');
			};
			n.text = function(){return 'Projects';};
			for (var i = 0; i < user.projects.length; ++i) {
				var prj = user.projects[i];
				prj = addChild(n,node(prj,n.$key +':'+prj.__));
				prj.setup = prjSetup;
			}

			n = addChild(root,node(undefined,'Team'));
			n.setup = function (s){
				this.pinPoint = {x:-38,y:-38};
				s.append('circle').attr({fill:'white',r:28});
				s.append('use').attr({'xlink:href':'#team',width:50,height:50,x:-25,y:-25});
			};
			
			n = addChild(root,node(undefined,'Health'));
			n.setup = function (s){
				this.pinPoint = {x:-38,y:-38};
				s.append('circle').attr({fill:'white',r:28});
				s.append('use').attr({'xlink:href':'#health',width:50,height:50,x:-25,y:-20});
			};

			n = addChild(root,node(undefined,'Gauge'));
			n.setup = function (s){
				this.pinPoint = {x:-38,y:-38};
				s.append('circle').attr({fill:'white',r:28});
				s.append('use').attr({'xlink:href':'#gauge',width:50,height:50,x:-25,y:-22});
			};
			
		}
		
		makeTree();
		
		var force = d3.layout.force()
			.size([svgObj.width,svgObj.height])
			.charge(-400)
			.linkDistance(80)
			.gravity(0)
			.on('tick',tick);
		
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
					if (d.fixed === false && d.$vis !== undefined) {
						d.removePin();
					}
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
				.each(function(d){d.$vis = undefined;})
				.transition()
					.duration(300)
					.attr('opacity',0)
					.attr('fill-opacity',0)
					.attr('transform',function(d){return 'translate('+d.parent.x +','+d.parent.y+')';})
					.remove();
			nel.enter().append('g')
				.classed('node',true)
				.each(function(d){d.$vis = d3.select(this); d.setup(d3.select(this)); if(d.fixed && d.parent !== undefined) d.appendPin();})
				.call(force.drag)
				.on('click',function(d){
					if (d3.event.defaultPrevented) return;
					d3.event.stopPropagation();
					d.expanded = !d.expanded;
					d.fixed = d.expanded || d.parent === undefined;
					if (d.parent !== undefined) {
						if (d.fixed === true) {
							d.appendPin();
						} else {
							d.removePin();
						}
					}	
					unfixChildren(d);
					update();
				});
			force.nodes(nodes).links(links).start();
		}		
		update();
		
      }
    };
  }]);
