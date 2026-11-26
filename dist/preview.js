/* Dimensions are schematic millimetres. The preview does not verify physical fit. */
function drawAssembly(parts, extraDrives) {
  const canvas = document.getElementById('assembly');
  const orbit = document.getElementById('orbit');
  const context = canvas.getContext('2d');
  if (!context) return;
  const angle = Number(orbit.value) * Math.PI / 180;
  const tilt = 0.22;
  const faces = [];
  function project([x, y, z]) {
    const horizontal = x * Math.cos(angle) + z * Math.sin(angle);
    const depth = z * Math.cos(angle) - x * Math.sin(angle);
    return [280 + horizontal * 0.79, 206 - (y * Math.cos(tilt) - depth * Math.sin(tilt)) * 0.79,
      depth * Math.cos(tilt) + y * Math.sin(tilt)];
  }
  function box(x, y, z, width, height, depth, colours) {
    const corners = [];
    for (const dz of [-1,1]) for (const dy of [-1,1]) for (const dx of [-1,1]) {
      corners.push(project([x + dx*width/2, y + dy*height/2, z + dz*depth/2]));
    }
    const sides = [[0,1,3,2],[4,5,7,6],[0,2,6,4],[1,3,7,5],[0,4,5,1],[2,3,7,6]];
    sides.forEach((side,i) => {
      const points = side.map(index => corners[index]);
      faces.push({points, colour:colours[Math.floor(i/2)], depth:points.reduce((sum,p)=>sum+p[2],0)/4});
    });
  }
  const frame = parts[6] ? ['#a85832','#7c432c','#c0825c'] : ['#d8cfc1','#d5c9b8','#e4dbce'];
  const board = ['#3c6055','#30453e','#698e77'];
  const dark = ['#404348','#323338','#626568'];
  const metal = ['#a8a49b','#76756f','#d5cfc1'];
  const copper = ['#b96b41','#895035','#da996b'];
  // Open chassis edges leave the internal modules visible from both sides.
  for (const x of [-155,155]) for (const z of [-78,78]) box(x,0,z,4,384,4,frame);
  for (const y of [-192,192]) {
    for (const z of [-78,78]) box(0,y,z,314,4,4,frame);
    for (const x of [-155,155]) box(x,y,0,4,4,156,frame);
  }
  if(parts[2]) {
    const form = parts[2].spec.form ?? '';
    const size = /ITX/i.test(form) ? 165 : /micro|matx/i.test(form) ? 210 : 248;
    box(-22,47,-66,size,size,5,board);
    for(let i=0;i<3;i++)box(-38,0-i*12,-58,102,4,7,dark);
  }
  if(parts[0])box(-38,85,-58,39,39,7,metal);
  if(parts[1]) {
    for(let i=0;i<9;i++)box(-38,85,-50+i*6,62,65,3,metal);
    box(-38,85,4,56,54,5,dark);
  }
  if(parts[3])for(const x of [38,49])box(x,86,-52,5,85,20,copper);
  if(parts[5]) {
    const length=Math.min(292,Math.max(100,parts[5].spec.length??220));
    box(-143+length/2,-20,-8,length,26,92,dark);
    box(-143+length/2,-4,-8,length,4,92,metal);
  }
  if(parts[7])box(-85,-147,-4,116,73,117,dark);
  const drives=[parts[4],...extraDrives].filter(Boolean);
  drives.forEach((drive,i)=>{
    const m2=drive.spec.m2===true;
    if(m2)box(-20+(i%3)*10,29-(i%6)*12,-56+Math.floor(i/6)*5,62,13,4,board);
    else box(92,-150+(i%8)*13,0,74,9,66,metal);
  });
  context.clearRect(0,0,560,420);
  faces.sort((a,b)=>a.depth-b.depth);
  for(const face of faces){
    context.beginPath();
    face.points.forEach(([x,y],i)=>i?context.lineTo(x,y):context.moveTo(x,y));
    context.closePath();context.fillStyle=face.colour;context.fill();
  }
  const shown=[...parts.slice(0,8),...extraDrives].filter(Boolean);
  document.getElementById('model-note').textContent=shown.length?
    shown.length+' core component'+(shown.length===1?'':'s')+' shown. Approximate shapes and positions.':
    'Choose a core component to see its approximate shape.';
  orbit.oninput=()=>drawAssembly(parts,extraDrives);
  canvas.onpointerdown=event=>{
    canvas.setPointerCapture(event.pointerId);
    const start=event.clientX, rotation=Number(orbit.value);
    canvas.onpointermove=move=>{orbit.value=String(Math.max(-165,Math.min(165,rotation+(move.clientX-start)*0.8)));orbit.oninput()};
    canvas.onlostpointercapture=()=>{canvas.onpointermove=null};
  };
}
