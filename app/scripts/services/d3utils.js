'use strict';

/**
 * @ngdoc service
 * @name testYoApp.d3Utils
 * @description
 * # d3Utils
 * Service in the testYoApp.
 */
angular.module('testYoApp')
  .service('d3Utils', function () {
    // Service logic
    // ...

	function addChild(parent,child) {
		parent.children.push(child);
		child.parent = parent;
		return child;
	}
	
	var ns = DS.namespace('d3utils');
	
	DS.makeClass({
		name:'D3Link',
		namespace:ns,
		cnst:function(source,target,key){
			this.source = source;
			this.target = target;
			this.k = key;
		},
		load:function(){
			this.id = function(d){return d.k;};
		}
	});
	DS.makeClass({
		name:'D3Node',
		namespace:ns,
		cnst:function(data){
			this.$backing = data.backing;
			this.$key = data.key;
			this.children = data.children || [];
			this.parent = data.parent;
			this.expanded = data.expanded || false;
		},
		load:function(){
			this.id = function(d){return d.$key;};
		},
		proto:function(p) {
			p.addChild = function(c){
				this.children.push(c);
				c.parent = this;
			};
			p.reachableNodes = function(arr){
				var res = arr || [];
				res.push(this);
				if (this.expanded) {
					for (var i = 0; i < this.children.length; ++i) {
						var c = this.children[i];
						c.reachableNodes(res);
					}
				}
				return res;
			};
			p.reachableLinks = function(arr) {
				var res = arr || [];
				if (this.expanded) {
					for (var i = 0; i < this.children.length; ++i) {
						var c = this.children[i];
						res.push(new ns.D3Link(this,c,c.$key));
					}
					for (var i = 0; i < this.children.length; ++i) {
						this.children[i].reachableLinks(res);
					}					
				}
				return res;	
			};
		},
	});
	
	function node(backing,key) {
		return {
			backing:backing,
			key:key,
			children:[],
			parent:undefined,
		};
	} 
	function link(n1,n2) {
		return {source:n1,target:n2};
	}


	function makeSvgBaseView(root,w,h) {
		var svg = d3.select(root[0]).append('svg').attr('viewBox','0 0 ' + w + ' ' + h).attr({width:'100%',height:'100%'});
		var defs = svg.append('defs');
		var ctrlGroup = svg.append('g');
		ctrlGroup.append('rect')
			.attr('width',w)
			.attr('height',h)
			.style('fill','none')
			.style('pointer-events','all');
		var content = svg.append('g');
			
		return {
			svg:svg,
			defs:defs,
			ctrlGroup:ctrlGroup,
			content:content,
			width:w,
			height:h,
		};
	}

	function newZoomFunc(target) {
		return function () {
			target.attr('transform','translate('+d3.event.translate+')scale('+d3.event.scale+')');
		};
	}

	function addZoom(source,target,min,max) {
		var zoomer = d3.behavior.zoom()
			 .scaleExtent([min, max])
			 .on("zoom", newZoomFunc(target));
		source.call(zoomer);
		return zoomer;
	}

	function addZoomBaseView(view,min,max) {
		view.zoom = addZoom(view.ctrlGroup,view.content,min,max);
	}

	this.baseSvg = makeSvgBaseView;
	this.addZoom = addZoom;
	this.addZoomBaseView = addZoomBaseView;
	this.graph = {node:node,link:link,addChild:addChild,d3node:ns.D3Node,d3link:ns.D3Link};
    
  });
