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
		var svg = d3.select(root[0]).append('svg').attr('viewBox','0 0 ' + w + ' ' + h);
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
	this.graph = {node:node,link:link,addChild:addChild};
    
  });
