'use strict';

/**
 * @ngdoc service
 * @name testYoApp.demoData
 * @description
 * # demoData
 * Service in the testYoApp.
 */
angular.module('testYoApp')
  .service('demoData', function () {
    // AngularJS will instantiate a singleton by calling "new" on this function
	var inputTypes = {
		 p: {
			 '__':'p',
			 name:'Location',
			 precision:[1,'m'],
		 },
		 r: {
			'__':'r',
			name:'Rotation',
			percision:[1,'d'],
		 },
		 d: {
			 '__':'d',
			 name:'Distance',
			 precision:[0.5,'m'],
		 }
	 };
	 
	 var kinds = {
		'c': {
			name:'Crane',
			desc:'Object used to lift heavy loads around a construction site',
			fields:{
				name:{type:'s',disp:'Name',desc:'The name of the crane'},
				manufacturer:{type:'s',disp:'Manufacturer',desc:'The manufacturer of this item'},
				height:{type:'n',units:'length',disp:'Height',desc:'The height of the crane'},
				front_radius:{type:'n',units:'length',disp:'Front Radius',desc:'The loading arm length'},
				back_radius:{type:'n',units:'length',disp:'Rear Radius',desc:'The balancing arm length'},
				max_load:{type:'n',units:'wight',disp:'Max Load',desc:'The maximal weight the crane can lift'},
				color:{type:'s',disp:'Color',desc:'The designated color of the crane'},
				front_width:{type:'n',units:'length',disp:'Front jib width',desc:'the max width of the front jib'},
				rear_width:{type:'n',units:'length',disp:'Rear jib width',desc:'the max width of the rear jib'},
				tower_width:{type:'n',units:'length',disp:'Width of the tower',desc:'the width of the tower leg'},
				tower_len:{type:'n',units:'length',disp:'Length of the tower',desc:'the length of the tower leg'},
				tower_radius:{type:'n',units:'length',disp:'Tower base radius',desc:'The maximal radius of the crane base'},
				max_slew_speed:{type:'n',units:'rpm',disp:'Revolutions/Minut',desc:'The maximal speed the crane is alowed to turn at'},
				break_speed:{type:'n',units:'rpm',disp:'Braking speed',desc:'The maximal breaking speed'},
			},
			icon:'crane_icon',
			measurments: {
				base_location:{type:inputTypes['p'],disp:'Base position',desc:'position of the base of the crane',guard:{type:'n',units:'length',val:[3,'m']}},
				rotation:{type:inputTypes['r'],disp:'Rotation',desc:'Rotation of the crane',guard:{type:'n',units:'rotation',val:[3,'d']}},
				anchor_pos:{type:inputTypes['p'],disp:'Anchor location',desc:'The location of the anchor',guard:{type:'n',units:'length',val:[1,'m']}},
				trolly_pos:{type:inputTypes['d'],disp:'Trolly distance',desc:'The distance of the trolly on main jib'},
				hook_block_height:{type:inputTypes['d'],disp:'Hook height',desc:'the distance of the hook from the jib'},
				slew_speed:{type:inputTypes['r'],disp:'Current slew speed',desc:'The angular velocity of the jib[rad/sec]'},
			},
		},
	 };
	 
	 var collisionTypes = {
	 	'ft' : {
	 		'__':'ft',
		 	desc:'Fron-jib to tower',
		 	severity:0.8,
		 	illegalSetting:false,
	 	},
	 	'rt' : {
	 		'__':'rt',
		 	desc:'Rear-jib to tower',
		 	severity:0.9,
		 	illegalSetting:false,
	 	},
		'ff': {
	 		'__':'ff',
			desc:'Front-jib to Front-jib',
			severity:1.0,
			illegalSetting:true,  
		},
		'fr': {
	 		'__':'fr',
			desc:'Fron-jib to Rear-jib',
			severity:1.0,
			illegalSetting:true,			
		},
		'rf': {
	 		'__':'rf',
			desc:'Rear-jib to Fron-jib',
			severity:1.0,
			illegalSetting:true,						
		},
		'rr': {
	 		'__':'rr',
			desc:'Rear-jib to Rear-jib',
			severity:1.0,
			illegalSetting:true,						
		},
		'cf': {
	 		'__':'cf',
			desc:'Cable to Front-jib',
			severity:0.5,
			illegalSetting:false,
		},
		'cr': {
	 		'__':'cr',
			desc:'Cable to Rear-jib',
			severity:0.7,	
		},
		'fc': {
	 		'__':'fc',
			desc:'Front-jib to Cable',
			severity:0.5,
			illegalSetting:false,
		},
		'rc': {
	 		'__':'rc',
			desc:'Rear-jib to Cable',
			severity:0.7,	
			illegalSetting:false,
		},		
	 };
	 
	 var measurments = {
		crane_01:{
			base_location:{
					series:[{t:[1,'s'],x:[200,'m'],y:[200,'m'],z:[0,'m']}],
					latest:{t:[1,'s'],x:[200,'m'],y:[200,'m'],z:[0,'m']}
			},
			rotation: {
				series:[{t:[1,'s'],r:[Math.PI/4,'d']}],
				latest:{t:[1,'s'],r:[Math.PI/4,'d']},
			},
			trolly_pos: {
				latest:{t:[1,'s'],d:[40,'m']},
			},
			hook_block_height: {
				latest:{t:[1,'s'],d:[40,'m']},
			},
			slew_speed: {
				latest:{t:[1,'s'],v:[0,'r']}
			},
			
		},
		crane_02:{
			base_location:{
					series:[{t:[1,'s'],x:[250,'m'],y:[230,'m'],z:[0,'m']}],
					latest:{t:[1,'s'],x:[150,'m'],y:[250,'m'],z:[0,'m']}
			},
			rotation: {
				series:[{t:[1,'s'],r:[-Math.PI/4,'d']}],
				latest:{t:[1,'s'],r:[-Math.PI/4,'d']},
			},	
			trolly_pos: {
				latest:{t:[1,'s'],d:[40,'m']},
			},
			hook_block_height: {
				latest:{t:[1,'s'],d:[40,'m']},
			},
			slew_speed: {
				latest:{t:[1,'s'],v:[0,'r']}
			},
		},
		crane_03:{
			base_location:{
					series:[{t:[1,'s'],x:[250,'m'],y:[230,'m'],z:[0,'m']}],
					latest:{t:[1,'s'],x:[250,'m'],y:[250,'m'],z:[0,'m']}
			},
			rotation: {
				series:[{t:[1,'s'],r:[0.8*Math.PI,'d']}],
				latest:{t:[1,'s'],r:[0.8*Math.PI,'d']},
			},					
			trolly_pos: {
				latest:{t:[1,'s'],d:[40,'m']},
			},
			hook_block_height: {
				latest:{t:[1,'s'],d:[40,'m']},
			},
			slew_speed: {
				latest:{t:[1,'s'],v:[0,'r']}
			},
		},
		crane_04:{
			base_location:{
					series:[{t:[1,'s'],x:[250,'m'],y:[230,'m'],z:[0,'m']}],
					latest:{t:[1,'s'],x:[250,'m'],y:[150,'m'],z:[0,'m']}
			},
			rotation: {
				series:[{t:[1,'s'],r:[1.8*Math.PI,'d']}],
				latest:{t:[1,'s'],r:[1.8*Math.PI,'d']},
			},					
			trolly_pos: {
				latest:{t:[1,'s'],d:[40,'m']},
			},
			hook_block_height: {
				latest:{t:[1,'s'],d:[10,'m']},
			},
			slew_speed: {
				latest:{t:[1,'s'],v:[0,'r']}
			},
		},
		crane_05:{
			base_location:{
					series:[{t:[1,'s'],x:[250,'m'],y:[230,'m'],z:[0,'m']}],
					latest:{t:[1,'s'],x:[150,'m'],y:[150,'m'],z:[0,'m']}
			},
			rotation: {
				series:[{t:[1,'s'],r:[0,'d']}],
				latest:{t:[1,'s'],r:[0,'d']},
			},					
			trolly_pos: {
				latest:{t:[1,'s'],d:[20,'m']},
			},
			hook_block_height: {
				latest:{t:[1,'s'],d:[15,'m']},
			},
			slew_speed: {
				latest:{t:[1,'s'],v:[0,'r']}
			},
		},
	
	 };
	 
	 var inventory = {
		crane_01 : {
			'_':kinds['c'],
			'__':'crane_01',
			name:'demo 1',
			manufacturer:'craner',
			height:[60,'m'],
			front_radius:[50,'m'],
			back_radius:[20,'m'],
			max_load:[10,'t'],
			color:'red',
			front_width:[2,'m'],
			rear_width:[4,'m'],
			tower_radius:[2,'m'],
			max_slew_speed:[0.6,'rpm'],
			break_speed:[0.35,'rpm'],
		},
		crane_02 : {
			'_':kinds['c'],
			'__':'crane_02',
			name:'demo 2',
			manufacturer:'stork',
			height:[70,'m'],
			front_radius:[55,'m'],
			back_radius:[20,'m'],
			max_load:[12,'t'],
			color:'green',
			front_width:[2,'m'],
			rear_width:[4,'m'],
			tower_radius:[2,'m'],
			max_slew_speed:[0.7,'rpm'],
			break_speed:[0.3,'rpm'],
		},
		crane_03 : {
			'_':kinds['c'],
			'__':'crane_03',
			name:'demo 3',
			manufacturer:'pike',
			height:[50,'m'],
			front_radius:[65,'m'],
			back_radius:[30,'m'],
			max_load:[5,'t'],
			color:'blue',
			front_width:[2,'m'],
			rear_width:[4,'m'],
			tower_radius:[2,'m'],
			max_slew_speed:[0.7,'rpm'],
			break_speed:[0.2,'rpm'],
		},
		crane_04 : {
			'_':kinds['c'],
			'__':'crane_04',
			name:'demo 4',
			manufacturer:'pike',
			height:[40,'m'],
			front_radius:[75,'m'],
			back_radius:[30,'m'],
			max_load:[8,'t'],
			color:'yellow',
			front_width:[2,'m'],
			rear_width:[4,'m'],
			tower_radius:[2,'m'],
			max_slew_speed:[0.7,'rpm'],
			break_speed:[0.1,'rpm'],
		},
		crane_05 : {
			'_':kinds['c'],
			'__':'crane_05',
			name:'demo 5',
			manufacturer:'pike',
			height:[30,'m'],
			front_radius:[35,'m'],
			back_radius:[20,'m'],
			max_load:[8,'t'],
			color:'orange',
			front_width:[2,'m'],
			rear_width:[4,'m'],
			tower_radius:[2,'m'],
			max_slew_speed:[0.8,'rpm'],
			break_speed:[0.4,'rpm'],
		},
	 };
	 
	 var timingStats = {
	 	c: {
		 	plateProcess : {
				connect : {t:1*60,u:'s',desc:'Connection time',heightFunc:function(h){return 0;}},//connection time in seconds
				travel : {t:(7*60),u:'s',desc:'Lift time',heightFunc:function(h){return 13*h;}},//plate place release in seconds
				placeAndRelease : {t:(14*60),u:'s',desc:'Placement and release',heightFunc:function(h){return 0;}},//plate place release in seconds
				sim:function(h,bias){
					var conn = this.connect.t + this.connect.heightFunc(h) + (Math.random()-0.5)*2*10 + bias.connect*Math.random();
					var trav = this.travel.t + this.travel.heightFunc(h) + (Math.random()-0.5)*2*2*60 + bias.travel*Math.random();
					var plar = this.placeAndRelease.t + this.placeAndRelease.heightFunc(h) + (Math.random()-0.5)*2*4*60 + bias.placeAndRelease*Math.random();
					return [conn,trav,plar];
				},
				nextT:function(h){return this.connect.t+
										 this.travel.t+
										 this.placeAndRelease.t+
										 this.connect.heightFunc(h)+
										 this.travel.heightFunc(h)+
										 this.placeAndRelease.heightFunc(h);
				},
				maxAmount:function(count,t,h){
					var nextH = h(count+1); 
					var nextT = this.nextT(nextH); 
					var amount=0; 
					for(;t > nextT;){
						t-=nextT; 
						amount++;
						count++;
						nextH = h(count+1);
						nextT = this.nextT(nextH);
					}
					return amount;
				},
			},
			blockProcess: {
				connect : {t:2*60,u:'s',desc:'Connection time',heightFunc:function(h){return 0;}},//connection time in seconds
				travel : {t:(5*60),u:'s',desc:'Lift time',heightFunc:function(h){return 10*h;}},//plate place release in seconds
				placeAndRelease : {t:(3*60),u:'s',desc:'Placement and release',heightFunc:function(h){return 0;}},//plate place release in seconds
				sim:function(h,bias){
					var conn = this.connect.t + this.connect.heightFunc(h) + (Math.random()-0.5)*2*20 + bias.connect*Math.random();
					var trav = this.travel.t + this.travel.heightFunc(h) + (Math.random()-0.5)*2*2*60 + bias.travel*Math.random();
					var plar = this.placeAndRelease.t + this.placeAndRelease.heightFunc(h) + (Math.random()-0.5)*2*2*60 + bias.placeAndRelease*Math.random();
					return [conn,trav,plar];
				},
				nextT:function(h){return this.connect.t+
										 this.travel.t+
										 this.placeAndRelease.t+
										 this.connect.heightFunc(h)+
										 this.travel.heightFunc(h)+
										 this.placeAndRelease.heightFunc(h);
				},
				maxAmount:function(count,t,h){
					var nextH = h(count+1); 
					var nextT = this.nextT(nextH); 
					var amount=0; 
					for(;t > nextT;){
						t-=nextT; 
						amount++;
						count++;
						nextH = h(count+1);
						nextT = this.nextT(nexth);
					}
					return amount;
				},
			},
			reaquire:{
				travelTime:{t:(3*60),u:'s',desc:'Time to next load',heightFunc:function(h){return 6*h;}},
				sim:function(h,bias){
					var trav = this.travelTime.t + this.travelTime.heightFunc(h) + (Math.random()-0.5)*2*2*60 +	bias.travelTime*Math.random();
					return [trav];
				},
				nextT:function(h){
					return this.travelTime.t+this.travelTime.heightFunc(h);
				},
			},
		},
	 };
	 
	 function nextTProcess(h,process) {
		 var nextT = 0;
		 for (var i = 0; i< process.length; ++i) {
			 nextT+=process[i].nextT(h);
		 }
		 return nextT;
	 }
	 
	function maxAmount(count,h,t,process) {
		var nextH = h(count+1); 
		var nextT = nextTProcess(nextH,process); 
		var amount=0;
		for(;t >= nextT;){
			t-=nextT; 
			amount++;
			count++;
			nextH = h(count+1);
			nextT = nextTProcess(nextH,process);
		}
		return amount;		 
	}

	 
	 var ptotal = {
	 	days:0,
	 	plates:0,
	 	t:0,
	 	expected: {
		 	plateProcess: {
		 		connect:0,
		 		travel:0,
		 		placeAndRelease:0,
		 	},
		 	reaquire: {
				travelTime:0,
		 	},
	 	}
	 };
	 
	 var plateInterval = [];
	 function heightForPlate(n) {
		 for (var i = 0; i<plateInterval.length; ++i) {
			 if (n < plateInterval[i][0]) {
				 return plateInterval[i][1];
			 }
		 }
		 return plateInterval[plateInterval.length-1][1];
	 }
	 var projectExpectedSchedule = {total:ptotal,heightForPlate:heightForPlate,order:[]};
	 function projectDay(i) {
	 	var res = projectExpectedSchedule['d'+i];
		if (res === undefined) {
			var ts = timingStats.c;
			var h = i*10; //day height [m]
			var plates = maxAmount(0,function(i){return h;},12*60*60,[ts.reaquire,ts.plateProcess])/* + (Math.random()-0.5)*2*3*/;//how many plates today
			plates = Math.floor(plates);
			var connectionTime = plates*(ts.plateProcess.connect.t+ts.plateProcess.connect.heightFunc(h));
			var travelTime = plates*(ts.plateProcess.travel.t+ts.plateProcess.travel.heightFunc(h));
			var prTime = plates*(ts.plateProcess.placeAndRelease.t+ts.plateProcess.placeAndRelease.heightFunc(h));
			var ra = plates*(ts.reaquire.travelTime.t+ts.reaquire.travelTime.heightFunc(h));
			ptotal.t += connectionTime+travelTime+prTime;
			ptotal.plates += plates;
			ptotal.days++;
			plateInterval.push([ptotal.plates,h]);
			ptotal.expected.plateProcess.connect += connectionTime;
			ptotal.expected.plateProcess.travel += travelTime;
			ptotal.expected.plateProcess.placeAndRelease += prTime;
			ptotal.expected.reaquire.travelTime += ra;
			res = {
				plates:plates,
				h:h,
				t:(connectionTime+travelTime+prTime),
				expected:{
					plateProcess: {
			 			connect:connectionTime,
			 			travel:travelTime,
			 			placeAndRelease:prTime,
			 		},
			 		reaquire: {
			 			travelTime:ra,
			 		},
				},
			};
			projectExpectedSchedule['d'+i] = res;
			projectExpectedSchedule.order.push('d'+i);		 
		}
		return res;
	 }
	 
	 function simulateDay(dayPlates,bias,tplates,mplates) {
		var events = [];
		var ts = timingStats.c;

		var ttime = 12*60*60;
		var curTime = 0;

		var dayTot = {
		 	plateProcess: {
		 		connect:0,
		 		travel:0,
		 		placeAndRelease:0,
		 		plates:0,
		 	},
		 	reaquire: {
				travelTime:0,
		 	},				
		};
		var plates = 0;
		mplates = mplates < 0 ? 0 : mplates;
		for (;curTime<ttime && plates < dayPlates+mplates;) {
			var h=heightForPlate(tplates);
			var sim = ts.reaquire.sim(h,bias);
			if (curTime+sim[0] >= ttime) {
				curTime = ttime;
				continue;
			}
			dayTot.reaquire.travelTime += sim[0];
			events.push({s:curTime,f:curTime+sim[0],t:'reaq',l:sim[0],seg:sim});
			curTime += sim[0];
			sim = ts.plateProcess.sim(h,bias);
			var etot = sim[0]+sim[1]+sim[2];
			if (curTime+etot>= ttime) {
				curTime = ttime;
				continue;
			}
			tplates++;
			plates++;
			dayTot.plateProcess.connect += sim[0];
			dayTot.plateProcess.travel += sim[1];
			dayTot.plateProcess.placeAndRelease += sim[2];
			events.push({s:curTime,f:curTime+etot,t:'plate',l:etot,seg:sim});
			curTime += etot;
		}
		dayTot.plateProcess.plates = plates;
		return {total:dayTot,events:events};
	 }
	 
	 function simulateProject(days,bias) {
		var tplates = 0;
		var etplates = 0;
		var mplates = 0;
		var proj = {days:[]};
		var ts = timingStats.c;
		bias = bias || {};
		bias.connect = bias.connect || 0;
		bias.travel = bias.travel || 0;
		bias.placeAndRelease  = bias.placeAndRelease || 0;
		bias.travelTime = bias.travelTime || 0;
		for (var i = 0; i <days; ++i) {
			var day = projectDay(i);
			var progress = simulateDay(day.plates,bias,tplates,mplates);
			tplates+=progress.total.plateProcess.plates;
			etplates+=day.plates;
			mplates = etplates-tplates;
			proj.days.push(progress);
		}
		console.log('done 1');
		for(;tplates<projectExpectedSchedule.total.plates;) {
			var diff = projectExpectedSchedule.total.plates-tplates;			
			var progress = simulateDay(diff,bias,tplates,0);
			tplates+=progress.total.plateProcess.plates;
			proj.days.push(progress);
		}
		console.log('done 2');
		return proj;
	 }
	 
	 function pt(x,y) {
		 return {x:x,y:y};
	 }
	 
	 this.simulateProject = simulateProject;
	 this.projectExpectedSchedule = projectExpectedSchedule;
	 this.timingStats = timingStats;
	 this.inputTypes = inputTypes;
	 this.kinds = kinds;
	 this.inventory = inventory;
	 this.measurments = measurments;
	 this.collisionTypes = collisionTypes;
	 this.projects = {
		 p1:{
			inventory:inventory,
			name:'City Center',
			'__':'p1',
			frame:[pt(200,200),pt(200,170),pt(220,170),pt(220,200),pt(310,200),pt(310,220),pt(150,220),pt(150,300),pt(130,300),pt(130,220),pt(100,220),pt(100,200)],
			currentHeight:[20,'m'],
			targetHeight:[60,'m'],
		 },
	 };
});
