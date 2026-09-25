const scene = document.getElementById('scene');
const fpsEl = document.getElementById('fps');
const freq = document.getElementById('freq');
const glow = document.getElementById('glow');
const freqOut = document.getElementById('freqOut');
const glowOut = document.getElementById('glowOut');
const pulseBtn = document.getElementById('pulseBtn');
const menuBtn = document.getElementById('menuBtn');
const mobileMenu = document.getElementById('mobileMenu');

if (window.THREE) {
  const renderer = new THREE.WebGLRenderer({alpha:true, antialias:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  scene.appendChild(renderer.domElement);

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, .1, 100);
  camera.position.set(0, 1.5, 12);

  const world = new THREE.Scene();
  const group = new THREE.Group();
  world.add(group);

  const ambient = new THREE.AmbientLight(0x6677ff, .4);
  world.add(ambient);

  const key = new THREE.PointLight(0x4dfcff, 7, 20);
  key.position.set(2, 3, 4);
  world.add(key);

  const fill = new THREE.PointLight(0x9d55ff, 6, 18);
  fill.position.set(-4, -1, 1);
  world.add(fill);

  const geometry = new THREE.IcosahedronGeometry(2.1, 5);
  const material = new THREE.MeshStandardMaterial({
    color: 0x11163d, metalness: .65, roughness: .23,
    emissive: 0x1826a0, emissiveIntensity: 1.5,
    wireframe: false
  });
  const orb = new THREE.Mesh(geometry, material);
  group.add(orb);

  const wire = new THREE.LineSegments(
    new THREE.WireframeGeometry(geometry),
    new THREE.LineBasicMaterial({color:0x63eaff, transparent:true, opacity:.13})
  );
  group.add(wire);

  const ringGeo = new THREE.TorusGeometry(3.05, .012, 16, 160);
  const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({color:0xa982ff, transparent:true, opacity:.55}));
  ring.rotation.x = Math.PI * .67;
  ring.rotation.z = -.25;
  group.add(ring);

  // Particle field
  const count = 1200;
  const pos = new Float32Array(count * 3);
  for(let i=0;i<count;i++){
    const r = 10 + Math.random() * 8;
    const a = Math.random() * Math.PI * 2;
    const y = (Math.random()-.5) * 9;
    pos[i*3] = Math.cos(a)*r;
    pos[i*3+1] = y;
    pos[i*3+2] = Math.sin(a)*r - 4;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pos,3));
  const pMat = new THREE.PointsMaterial({color:0x6c79ff, size:.025, transparent:true, opacity:.55});
  const points = new THREE.Points(pGeo,pMat);
  world.add(points);

  // Grid floor
  const grid = new THREE.GridHelper(28, 50, 0x2331a3, 0x12162f);
  grid.position.y = -3.2;
  grid.material.transparent = true;
  grid.material.opacity = .28;
  world.add(grid);

  const pointer = {x:0,y:0};
  window.addEventListener('pointermove', e => {
    pointer.x = (e.clientX / window.innerWidth - .5);
    pointer.y = (e.clientY / window.innerHeight - .5);
  }, {passive:true});

  let t0 = performance.now(), frames = 0;
  let speed = .0008;
  let pulse = 0;

  function animate(t){
    requestAnimationFrame(animate);
    frames++;
    if(t-t0>700){ fpsEl.textContent = Math.round(frames*1000/(t-t0)); frames=0; t0=t; }

    const f = Number(freq.value)/62;
    const g = Number(glow.value)/78;
    orb.rotation.x += .0025 * f;
    orb.rotation.y += .004 * f;
    wire.rotation.copy(orb.rotation);
    ring.rotation.z += .002 * f;
    points.rotation.y += .00013 * f;
    group.position.x += (pointer.x * .8 - group.position.x) * .035;
    group.position.y += (-pointer.y * .55 - group.position.y) * .035;

    // subtle pulsing
    const s = 1 + Math.sin(t*0.0012*speed*1000) * .028 + pulse*.12;
    orb.scale.setScalar(s);
    material.emissiveIntensity = 1.1 + g*1.1 + pulse*.9;
    key.intensity = 6 + g*7 + pulse*12;
    pulse *= .9;

    renderer.render(world,camera);
  }
  animate(0);

  window.addEventListener('resize',()=>{
    camera.aspect = window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth,window.innerHeight);
  });
} else {
  scene.style.background = 'radial-gradient(circle at 65% 45%, #2035a2, transparent 35%), radial-gradient(circle at 35% 60%, #551a8a, transparent 28%), #05060a';
}

freq.addEventListener('input',()=>freqOut.textContent=freq.value);
glow.addEventListener('input',()=>glowOut.textContent=glow.value);
pulseBtn.addEventListener('click',()=>{
  pulseBtn.textContent = 'PULSE SENT ✓';
  setTimeout(()=>pulseBtn.textContent='TRIGGER PULSE',900);
  document.body.animate([
    {filter:'brightness(1)'},
    {filter:'brightness(1.45)'},
    {filter:'brightness(1)'}
  ], {duration:420,easing:'ease-out'});
  window.dispatchEvent(new Event('pulse'));
});

menuBtn.addEventListener('click',()=>mobileMenu.classList.toggle('open'));
mobileMenu.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>mobileMenu.classList.remove('open')));

// Magnetic button effect
document.querySelectorAll('.btn,.card-link').forEach(el=>{
  el.addEventListener('pointermove',e=>{
    const r=el.getBoundingClientRect();
    const x=(e.clientX-r.left-r.width/2)*.08;
    const y=(e.clientY-r.top-r.height/2)*.08;
    el.style.transform=`translate(${x}px,${y}px)`;
  });
  el.addEventListener('pointerleave',()=>el.style.transform='');
});
