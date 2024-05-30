// GLOBAL
const nearDist = 1;
const farDist = 100;
const camera = new THREE.PerspectiveCamera(
	45,
	window.innerWidth / window.innerHeight,
	nearDist,
	farDist
);
const scene = new THREE.Scene();
const renderer = new THREE.WebGLRenderer({ antialias: true });
const canvasWrapper = document.querySelector("#canvas-wrapper");
const clock = new THREE.Clock();
const controls = new THREE.OrbitControls(camera, renderer.domElement);

const init = () => {
	camera.position.set(2, 2, -5);
	camera.lookAt(new THREE.Vector3()); // Look at the origin of the world
	
	renderer.setClearColor(defaultColor);
	renderer.setSize(window.innerWidth, window.innerHeight);

	canvasWrapper.appendChild(renderer.domElement);
};
init();

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min;
}

const group = new THREE.Group();


// 3D LAMP
const radius = 1;
const widthSeg = radius * 32;
const heightSeg = widthSeg;
const sphereGeom = new THREE.SphereBufferGeometry(radius, widthSeg, heightSeg);
const materialMono = new THREE.MeshPhongMaterial({
	side: THREE.FrontSide,
	transparent: true,
	opacity: .95,
	emissive: softDefaultColor,
	shininess: 30,
});
const materialDeep = new THREE.MeshPhongMaterial({
	color: deepLightColor,
	side: THREE.FrontSide,
	transparent: true,
	opacity: .95,
	emissive: solidDefaultColor,
	shininess: 40,
});
const sphere = new THREE.Mesh(sphereGeom, materialMono);
group.add(sphere);

const icosahedronGeom = new THREE.IcosahedronGeometry(radius, 1);
const points = icosahedronGeom.vertices;

let bubbbles;
points.forEach(point => {
	// I learned this with Matt Deslauriers
	bubbbles = new THREE.Mesh(sphereGeom, materialMono);
	bubbbles.position.copy(point).multiplyScalar(1.1); // multiplyScalar - moves bubbles outside sphere diameter
	bubbbles.scale.setScalar(getRandomArbitrary(0.3, 0.5));
	group.add(bubbbles);
});

scene.add(group);

// LIGHT
const Light = function () {
	return new THREE.PointLight(lightColor, 1, 0);
};
const lightDepth = 1.5;

// Lights to rotate in the x axis
const lightA = new Light();
lightA.position.set(0, 0, lightDepth);
scene.add(lightA);

const lightB = new Light();
lightB.position.set(lightDepth, 0, 0);
scene.add(lightB);

// Lights to rotate in the y axis
const lightZ = new Light();
lightZ.position.set(0, 0, lightDepth);
scene.add(lightZ);

const lightY = new Light();
lightY.position.set(0, lightDepth, 0);
scene.add(lightY);

// LAMP COLOR & ANIMATION TOGGLE
let currentTime;
let IS_ANIMATED = true;
const toggle = {
	btnAnim: document.querySelector("#toggle-anim button"),
	btnColor: document.querySelectorAll("#toggle-color button"),
	updateMaterial(mode) {
		const toggleMaterial =
			mode === "monochrome" ? materialMono : materialDeep;

		const obj = group.children;
		const raycaster = new THREE.Raycaster();
		const intersects = raycaster.intersectObjects(obj, true);

		obj.forEach((el) => {
			el.material = toggleMaterial;
			el.material.needsUpdate = true;
		});
	},
	checkActiveBtnColor() {
		this.btnColor.forEach((el) => {
			el.addEventListener("click", (e) => {
				e.preventDefault();

				const target = e.currentTarget;

				this.btnColor.forEach((l) => delete l.dataset.active);
				target.dataset.active = true;

				this.updateMaterial(target.dataset.mode);
			});
		});
	},
	checkActiveBtnAnim() {
		this.btnAnim.addEventListener("click", (e) => {
			e.preventDefault();

			const target = e.currentTarget;
			const txtPlay = `play`;
			const txtPause = `pause`;
			const iconPlay = `►`;
			const iconPause = `||`;
			
			function setBtnData(btn, icon) {
				target.dataset.action = btn;
				target.title = btn;
				target.textContent = icon;
			}
		
			if (target.dataset.action === 'pause') {
				setBtnData(txtPlay, iconPlay);
				IS_ANIMATED = false;
				clock.stop();
				currentTime = clock.elapsedTime;
			} else {
				setBtnData(txtPause, iconPause);
				IS_ANIMATED = true;
				clock.start();
				clock.elapsedTime = currentTime;
			}
		});
	}
};
toggle.checkActiveBtnColor();
toggle.checkActiveBtnAnim();

// SCREEN RESIZE
const onWindowResize = () => {
	const w = window.innerWidth;
	const h = window.innerHeight;
	
	camera.aspect = w / h;
	camera.updateProjectionMatrix();

	renderer.setSize(w, h);	
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
};
window.addEventListener("resize", onWindowResize);

// CONTROLS INTERACTION
const createControls = () => {
	// Make sure to run controls outside render function 	
	// If edit controls update controls while rendering
	controls.autoRotateSpeed = 3.0;
	controls.enableDamping = true;
	controls.dampingFactor = 0.15;
	controls.enableZoom = true;
	controls.minDistance = 1;
	controls.maxDistance = 8;
	controls.keyPanSpeed = 30;
};
createControls();

// CREATE ANIMATIONS
const createAnimLights = () => {
	const orbitAngle = clock.getElapsedTime()/2;
	
	if (IS_ANIMATED) {	
		// Lights rotating in the x axis
		lightA.position.x = Math.cos(orbitAngle) * lightDepth*-1;
		lightA.position.z = Math.sin(orbitAngle) * lightDepth;
		
		lightB.position.x = Math.cos(orbitAngle) * lightDepth;
		lightB.position.z = Math.sin(orbitAngle) * lightDepth*-1;
		
		// Lights rotating in the y axis
		lightZ.position.y = Math.cos(orbitAngle) * lightDepth*-1;
		lightZ.position.z = Math.sin(orbitAngle) * lightDepth;
		
		lightY.position.y = Math.cos(orbitAngle) * lightDepth;
		lightY.position.z = Math.sin(orbitAngle) * lightDepth*-1;
	} 
};

// RENDER 3D LAMP
const render = () => {	
	createAnimLights();
	
	controls.autoRotate = IS_ANIMATED ? true : false;
	controls.update();
	
	renderer.render(scene, camera);

	requestAnimationFrame(render);
};
render();