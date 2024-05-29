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