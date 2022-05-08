const fs = require('fs');
const { brs } = OMEGGA_UTIL;
let brsfile = fs.readFileSync(__dirname + "/misc/Creeper.brs");
const creeperbrick = brs.read(brsfile);
brsfile = fs.readFileSync(__dirname + "/misc/Creeper.bp", 'utf8');
const mini = brsfile;
brsfile = fs.readFileSync(__dirname + "/Maps/CreeperTestMap.brs");
const testmap = brs.read(brsfile);
let ticks = 0;
let remover;
let brickstoremove = [];
let time = 0;
let round = -1;
let maxrounds = 3;
let spread = false;
let reseting = false;
let prevplramount = 0;
let mapbrickcount = 0;
let timeremaining = 0;
let aggrotimer = 4;
//let finishedtick = true;
var timeout;
let chunk = 0;
let backupmapsave = [];
const directions = [[2,1,0],[0,2,1],[0,1,2]]
const clrs = {
	red: "<color=\"FF0000\">",
	orange: "<color=\"FF5500\">",
	yellow: "<color=\"FFFF00\">",
	green: "<color=\"00FF00\">",
	white: "<color=\"FFFFFF\">",
	e: "</>"
};

class Creeper {

	constructor(omegga, config, store) {
		this.omegga = omegga;
		this.config = config;
		this.store = store
	}

	async tickhandler() {
		//if(!finishedtick) {
			//return;
		//}
		//finishedtick = false;
		const dirs = [[-1,0,0],[1,0,0],[0,-1,0],[0,1,0],[0,0,-1],[0,0,1]];
		function random(max) {
			return Math.floor(Math.random() * max);
		}
		const brsobj = await this.omegga.getSaveData();
		const players = await this.omegga.getAllPlayerPositions();
		//if(players.length == 0) {console.log(players);}
		if(typeof brsobj == 'undefined') {
			return;
		}
		if(players.length == 0) {
			return;
		}
		//spreading
		var deadcount = 0;
		var succesfullbricks = 0;
		var checked = false;
		var sensed = false;
		var toclear = 0;
		let areastoremove = [];
		const brslen = brsobj.brick_count;
		let bricksremoved = 0;
		const howmanytocheck = Math.floor((brsobj.brick_count - mapbrickcount)/1000)+1;
		chunk = chunk%howmanytocheck;
		
		let creeperbriks = {...creeperbrick,bricks:[],brick_owners:[{id: "5f1b5a7e-5544-4ab3-8890-4b12d1523540",name: "Creeper",bricks: 0}]};
		//Math.floor(brslen*(chunk/howmanytocheck))
		//Math.floor(brslen*((chunk+1)/howmanytocheck))
		for(var i=chunk;i<brslen;i+=howmanytocheck) {
			//for(var times=0;times<howmanytocheck;times++) {
			var nearbrick = false;
			var withindist = false;
			const brick = brsobj.bricks[i];
			if(brick !== 'undefined') {
				const brickowner = brsobj.brick_owners[brick.owner_index - 1].name;
				const brickcolor = brick.color;
				if(brickowner == "Creeper") {
					let ispainted = false;
					for(var i2=0;i2<players.length && !ispainted;i2++) {
						if(players[i2] !== 'undefined') {
							const plyrpos = players[i2].pos;
							const brickpos = brick.position;
							const dead = players[i2].isDead;
							if(dead && !checked) {
								deadcount++;
							}
							if(plyrpos !== null && brickpos !== null) {
								if(brickpos[0]<plyrpos[0]+25 && brickpos[0]>plyrpos[0]-25 && brickpos[1]<plyrpos[1]+25 && brickpos[1]>plyrpos[1]-25 && brickpos[2]<plyrpos[2]+36 && brickpos[2]>plyrpos[2]-32 && !dead && !reseting) {
									this.omegga.getPlayer(players[i2].player.id).kill();
								}
								if(brickpos[0]<plyrpos[0]+55 && brickpos[0]>plyrpos[0]-55 && brickpos[1]<plyrpos[1]+55 && brickpos[1]>plyrpos[1]-55 && brickpos[2]<plyrpos[2]+66 && brickpos[2]>plyrpos[2]-62 && !dead && !reseting) {
									nearbrick = true;
									sensed = true;
								}
								if(brickpos[0]<plyrpos[0]+95 && brickpos[0]>plyrpos[0]-95 && brickpos[1]<plyrpos[1]+95 && brickpos[1]>plyrpos[1]-95 && brickpos[2]<plyrpos[2]+106 && brickpos[2]>plyrpos[2]-102 && !dead && !reseting) {
									withindist = true;
								}
							}
						}
					}
					/*
					*For some reason every other method i used to check if an array contained an array didnt work so i had to resort
					*to comming atroceties.
					*/
					//var includes = false;
					//for(var egg=0;egg<brickstoremove.length;egg++) {
						//if(brickstoremove[egg][0] === brick.position[0] && brickstoremove[egg][1] === brick.position[1] && brickstoremove[egg][2] === brick.position[2]) {
							//includes = true;
						//}
					//}
					
					if(brickcolor !== 87 && brickcolor !== 92) {
						//if(!includes) {
							//this.omegga.clearRegion({center: brick.position,extent: brick.size});
						//}
						//brickstoremove.push(brick.position);
						//const remove = setTimeout(() => { brickstoremove.splice(0,1); }, 700);
						toclear++;
						//if(withindist) {
							ispainted = true;
							if(areastoremove.length > 0) {
								for(var areas=0;areas<areastoremove.length;areas++) {
									const pos = areastoremove[areas].pos;
									const ext = areastoremove[areas].ext;
									const bp = brick.position;
									if(bp[0]<pos[0]+ext[0]+50 && bp[0]>pos[0]-ext[0]-50 && bp[1]<pos[1]+ext[1]+50 && bp[1]>pos[1]-ext[1]-50 && bp[2]<pos[2]+ext[2]+60 && bp[2]>pos[2]-ext[2]-60) {
										if(bp[0]<pos[0]-ext[0] || bp[0]>pos[0]+ext[0] || bp[1]<pos[1]-ext[1] || bp[1]>pos[1]+ext[1] || bp[2]<pos[2]-ext[2] || bp[2]>pos[2]+ext[2]) {
											areastoremove[areas] = {pos: pos, ext: [ext[0]+30,ext[1]+30,ext[2]+36]};
										}
									}
								}
							}
							else {
								areastoremove.push({pos:brick.position, ext: [5,5,6]});
							}
							//brickstoremove.push({pos: brick.position, replace: false});
						//}
						//else {
							//brickstoremove.push({pos: brick.position, replace: true});
							//var bricktoplace = creeperbrick;
							//succesfullbricks++;
							//const clr = 87 + random(2)*5;
							//creeperbriks.bricks.push({...bricktoplace.bricks[0], position: brick.position, color: clr});
						//}
						bricksremoved++;
					}
					checked = true;
					if(((random(5) == 4 && ticks > 0 && i <= brslen/howmanytocheck) || (nearbrick || aggrotimer == 0)) && !ispainted) {
						const origpos = brick.position;
						for(var np=0;np<27;np++) {
							const x = np%3 - 1;
							const y = Math.floor(np/3)%3 - 1;
							const z = Math.floor(np/9)%3 - 1;
							//const x = dirs[np][0];
							//const y = dirs[np][1];
							//const z = dirs[np][2];
							if(x !== 0 || y !== 0 || z !== 0) {
								for(var ap=0;ap<6;ap++) {
									for(var i2=0;i2<brslen;i2++) {
										if(brsobj.bricks[i2] !== 'undefined') {
										const rotation = brsobj.bricks[i2].rotation;
										const bpb = brsobj.bricks[i2].position;
										const brdr = Math.floor(brsobj.bricks[i2].direction/2);
										var bpa = origpos;
										bpa = [bpa[0]+x*10,bpa[1]+y*10,bpa[2]+z*12];
										var size = brsobj.bricks[i2].size;
										if(rotation%2 == 1 ^ brdr == 1) {
											size = [size[1],size[0],size[2]];
										}
										size = [size[directions[brdr][0]],size[directions[brdr][1]],size[directions[brdr][2]]];
										var cp = [dirs[ap][0]*5,dirs[ap][1]*5,dirs[ap][2]*6];
										if(bpa[0] <= bpb[0] + size[0] && bpa[0] >= bpb[0] - size[0] && bpa[1] <= bpb[1] + size[1] && bpa[1] >= bpb[1] - size[1] && bpa[2] <= bpb[2] + size[2] && bpa[2] >= bpb[2] - size[2]) {
											ap = 6;
											i2 = brsobj.brick_count;
										}
										if(bpa[0]+cp[0] <= bpb[0] + size[0] && bpa[0]+cp[0] >= bpb[0] - size[0] && bpa[1]+cp[1] <= bpb[1] + size[1] && bpa[1]+cp[1] >= bpb[1] - size[1] && bpa[2]+cp[2] <= bpb[2] + size[2] && bpa[2]+cp[2] >= bpb[2] - size[2] && ap < 6) {
											if(brsobj.brick_owners[brsobj.bricks[i2].owner_index - 1].name !== "Creeper" && brsobj.materials[brsobj.bricks[i2].material_index] !== "BMC_Glow") {
												ap = 6;
												i2 = brsobj.brick_count;
												var bricktoplace = creeperbrick;
												succesfullbricks++;
												const clr = 87 + random(2)*5;
												creeperbriks.bricks.push({...bricktoplace.bricks[0], position: bpa, color: clr});
											}
										}
									}
								}
							}
						}
					}
					}
				}
				else if(brickcolor == 87 && brsobj.materials[brick.material_index] == "BMC_Glow" && brsobj.brick_count <= mapbrickcount+50) {
					if(random(7) == 6 && ticks > 0) {
					var size = [brick.size[0]/5+2,brick.size[1]/5+2,brick.size[2]/6+2];
					var origpos = brick.position;
					//origpos = [Math.floor(origpos[0]/10)*10+5,Math.floor(origpos[1]/10)*10+5,origpos[2]];
					const brotation = brick.rotation;
					if(brotation%2 == 1) {
						size = [size[1],size[0],size[2]];
					}
					const loopcount = (size[0]) * (size[1]) * (size[2]);
					const xs = 1 - Math.floor(size[0]/2)%2;
					const ys = 1 - Math.floor(size[1]/2)%2;
					for(var np=0;np<27;np++) {
						const x = np%3 - 1;
						const y = Math.floor(np/3)%3 - 1;
						const z = Math.floor(np/9)%3 - 1;
						//const x = dirs[np][0];
						//const y = dirs[np][1];
						//const z = dirs[np][2];
						//const z = 1;
						if(x !== 0 || y !== 0 || z !== 0) {
						//if(x > size[0] || y > size[1] || z > size[2] || x < size[0] || y < size[1] || z < size[2]) {
							for(var i2=0;i2<brslen;i2+=howmanytocheck) {
								for(var ap=0;ap<6;ap++) {
									const rotation = brsobj.bricks[i2].rotation;
									const bpb = brsobj.bricks[i2].position;
									var bpa = origpos;
									bpa = [bpa[0]+x*10-5*xs,bpa[1]+y*10+5*ys,bpa[2]+z*12];
									var size = brsobj.bricks[i2].size;
									if(rotation%2 == 1) {
										size = [size[1],size[0],size[2]];
									}
									var cp = [dirs[ap][0]*5,dirs[ap][1]*5,dirs[ap][2]*6];
									if(bpa[0] <= bpb[0] + size[0] && bpa[0] >= bpb[0] - size[0] && bpa[1] <= bpb[1] + size[1] && bpa[1] >= bpb[1] - size[1] && bpa[2] <= bpb[2] + size[2] && bpa[2] >= bpb[2] - size[2]) {
										ap = 6;
										i2 = brsobj.brick_count;
									}
									if(bpa[0]+cp[0] <= bpb[0] + size[0] && bpa[0]+cp[0] >= bpb[0] - size[0] && bpa[1]+cp[1] <= bpb[1] + size[1] && bpa[1]+cp[1] >= bpb[1] - size[1] && bpa[2]+cp[2] <= bpb[2] + size[2] && bpa[2]+cp[2] >= bpb[2] - size[2] && ap < 6) {
										if(brsobj.brick_owners[brsobj.bricks[i2].owner_index - 1].name !== "Creeper" && brsobj.materials[brsobj.bricks[i2].material_index] !== "BMC_Glow") {
											ap = 6;
											i2 = brsobj.brick_count;
											var bricktoplace = creeperbrick;
											succesfullbricks++;
											const clr = 87 + random(2)*5;
											creeperbriks.bricks.push({...bricktoplace.bricks[0], position: bpa, color: clr});
										}
									}
								}
							}
						}
					}
				}
				}
				else{
					const brslen2 = backupmapsave.brick_count;
					for(var i2=0;i2<brslen2;i2++) {
						const brick2 = backupmapsave.bricks[i2];
						if(brick2 !== 'undefined') {
							if(brick.position[0] == brick2.position[0] && brick.size[0] == brick2.size[0] && brick.position[1] == brick2.position[1] && brick.size[1] == brick2.size[1] && brick.position[2] == brick2.position[2] && brick.size[2] == brick2.size[2]) {
								const brickcolor2 = brick2.color;
								//var includes = false;
									//for(var egg=0;egg<brickstoremove.length;egg++) {
										//if(brickstoremove[egg][0] === brick.position[0] && brickstoremove[egg][1] === brick.position[1] && brickstoremove[egg][2] === brick.position[2]) {
											//includes = true;
										//}
								//}
								if(brickcolor !== brickcolor2) {
									const rotation = brick2.rotation;
									let size = brsobj.bricks[i2].size;
									if(rotation%2 == 1) {
										size = [size[1],size[0],size[2]];
									}
									//brickstoremove.push(brick.position);
									await this.omegga.clearRegion({center: brick2.position,extent: size});
									let map = testmap;
									await this.omegga.loadSaveData(map,{quiet: true});
								}
							}
						}
					}
				}
			}
		}
		let timespeed = Math.floor(time/60)-6;
		const playercount = players.length;
		//if(bricksremoved > 0) {console.log(bricksremoved + " attempted to remove.");}
		if(!reseting) {
			if(areastoremove.length > 0) {
				//console.log(areastoremove.length);
				for(var areas=0;areas<areastoremove.length;areas++) {
					var areasave = await this.omegga.getSaveData({center: areastoremove[areas].pos,extent: areastoremove[areas].ext});
					let toreplace = {...areasave,bricks:[]};
					await this.omegga.clearRegion({center: areastoremove[areas].pos,extent: areastoremove[areas].ext},{target: "5f1b5a7e-5544-4ab3-8890-4b12d1523540"});
					if(areasave !== null) {
						for(var i=0;i<areasave.brick_count;i++) {
							const brick = areasave.bricks[i];
							const brickcolor = brick.color;
							const brickowner = areasave.brick_owners[brick.owner_index - 1].name;
							if(brickcolor == 87 || brickcolor == 92 || brickowner !== "Creeper") {
								toreplace.bricks.push(brick);
							}
						}
					}
					if(toreplace.bricks.length > 0) {
						await this.omegga.loadSaveData(toreplace,{quiet: true});
						//console.log(areastoremove.length);
					}
				}
			}
			if(prevplramount !== playercount - deadcount) {
				prevplramount = playercount - deadcount;
				if(prevplramount < 4) {
					this.omegga.broadcast(clrs.red + prevplramount + clrs.e + " player(s) remaining.");
				}
				else {
					this.omegga.broadcast(prevplramount + " player(s) remaining.");
				}
			}
			if(playercount - deadcount <= 0) {
				this.NextRound();
				time = 600;
			}
			if(time > 0) {
				time-=0.5;
				if(timeremaining !== Math.ceil(time/120)) {
					timeremaining = Math.ceil(time/120);
					this.omegga.broadcast(clrs.yellow + timeremaining*2 + ":00" + clrs.e + " minutes remaining.");
				}
			}
			else {
				this.omegga.nextRoundMinigame(0);
				this.NextRound();
			}
			chunk++;
			if(sensed) {
				if(aggrotimer > 0) {aggrotimer--;}
			}
			else {
				if(aggrotimer < 4) {aggrotimer++;}
			}
		}
		if(succesfullbricks>0 && spread && time > 5) {
			creeperbriks.brick_count = succesfullbricks;
			await this.omegga.loadSaveData(creeperbriks,{quiet: true});
		}
		if(ticks == 0) {
			if(random(17+timespeed) == 16+timespeed) {
				ticks = random(5-timespeed) + 6-timespeed;
			}
		}
		else {
			ticks--;
			//console.log(deadcount + " " + playercount);
		}
		//finishedtick = true;
	}
	async NextRound() {
		reseting = true;
		timeremaining = 0;
		spread = false;
		if(round+1 == maxrounds) {
			this.omegga.broadcast("There is no map changer yet so the rounds will be just reset. Lol.");
			this.LoadMap();
			round = -1;
		}
		this.omegga.broadcast(clrs.yellow+"Next round begins in 5 seconds." + clrs.e);
		this.omegga.clearBricks("5f1b5a7e-5544-4ab3-8890-4b12d1523540",{quiet: true});
		timeout = setTimeout(() => {  this.start() }, 5000);
	}
	async start() {
		time = 600;
		reseting = false;
		spread = true;
		round++;
		ticks = 2;
		this.omegga.clearBricks("5f1b5a7e-5544-4ab3-8890-4b12d1523540",{quiet: true});
		this.omegga.broadcast("Game "+ clrs.yellow +(round+1)+" / "+maxrounds + clrs.e);
	}
	async LoadMap() {
		await this.omegga.clearAllBricks({quiet: true});
		let map = testmap;
		this.omegga.broadcast("Loading map.");
		await this.omegga.loadSaveData(map);
		const brsobj = await this.omegga.getSaveData();
		mapbrickcount = brsobj.brick_count;
		backupmapsave = brsobj;
		
	}
	async cleared() {
		const watcher = this.omegga.addWatcher(/Cleared 1 bricks!/,{timeoutDelay: 100, bundle: true});
		const timeout2 = setTimeout(() => {
			//brickstoremove.splice(0, watcher.length);
			Promise.resolve(watcher).then(function(value) {
				if(value.length > 0) {
					brickstoremove.splice(0, value.length);
				}
			});
			//const keys = Object.keys(watcher);
			//if(keys !== null) {if(watcher.keys >= 0){console.log(watcher.keys);}}
			//if(keys !== null) {console.log(keys);}
		}, 101);
		//if(brickstoremove.length > 0) {console.log(brickstoremove.length);}
		if(brickstoremove.length > 500) {
			brickstoremove = [];
		}
	}
	
	async init() {
		this.LoadMap();
		this.omegga.on('interact', brick => {
			//console.log(brick);
			this.omegga.clearRegion({center: brick.position,extent: [5,5,6]});
		});
		this.omegga.on('cmd:plcr', async name => {
			const playerpos = await this.omegga.getPlayer(name).getPosition();
			let brick = {...creeperbrick,brick_owners:[{id: "5f1b5a7e-5544-4ab3-8890-4b12d1523540",name: "Creeper",bricks: 0}]};
			brick.bricks[0].position = [Math.round(playerpos[0]),Math.round(playerpos[1]),Math.round(playerpos[2])]
			this.omegga.whisper(name, "Creeper!");
			this.omegga.loadSaveData(brick,{quiet: true});
		});
		this.omegga.on('cmd:forceend', async name => {
			time = 0;
		});
		//this.omegga.addMatcher(/Cleared 1 bricks!/, this.cleared());
		//this.tickhandler();
		//try{
			//var minigames = this.omegga.getMinigames();
		//}
		//catch{
			//console.log("test");
		//}
		//if(minigames.length == 0) {
		//this.omegga.deleteMinigame(0);
		//this.omegga.loadMinigame("Creeper");
		//}
		//remover = setInterval(() => this.cleared(),100);
		this.interval = setInterval(() => this.tickhandler(),500);
		return { registeredCommands: [] };
	}

	async stop() {
		this.omegga.removeAllListeners('cmd:plcr');
		//this.omegga.removeAllListeners(remover);
		this.omegga.removeAllListeners('interact');
		this.omegga.removeAllListeners('cmd:forceend');
		clearInterval(this.interval);
		//clearInterval(remover);
		clearTimeout(timeout);
	}
}
module.exports = Creeper;
