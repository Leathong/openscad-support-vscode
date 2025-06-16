import type { ModelViewerElement } from "@google/model-viewer";

// A minimal non-react version of
// https://github.com/openscad/openscad-playground/blob/main/src/components/ViewerPanel.tsx

export const PREDEFINED_ORBITS: [string, number, number][] = [
	["Diagonal", Math.PI / 4, Math.PI / 4],
	["Front", 0, Math.PI / 2],
	["Right", Math.PI / 2, Math.PI / 2],
	["Back", Math.PI, Math.PI / 2],
	["Left", -Math.PI / 2, Math.PI / 2],
	["Top", 0, 0],
	["Bottom", 0, Math.PI],
];

function spherePoint(theta: number, phi: number): [number, number, number] {
	return [
		Math.cos(theta) * Math.sin(phi),
		Math.sin(theta) * Math.sin(phi),
		Math.cos(phi),
	];
}

function euclideanDist(a: [number, number, number], b: [number, number, number]): number {
	const dx = a[0] - b[0];
	const dy = a[1] - b[1];
	const dz = a[2] - b[2];
	return Math.sqrt(dx * dx + dy * dy + dz * dz);
}
const radDist = (a: number, b: number) => Math.min(Math.abs(a - b), Math.abs(a - b + 2 * Math.PI), Math.abs(a - b - 2 * Math.PI));

function getClosestPredefinedOrbitIndex(theta: number, phi: number): [number, number, number] {
	const point = spherePoint(theta, phi);
	const points = PREDEFINED_ORBITS.map(([_, t, p]) => spherePoint(t, p));
	const distances = points.map(p => euclideanDist(point, p));
	const radDistances = PREDEFINED_ORBITS.map(([_, ptheta, pphi]) => Math.max(radDist(theta, ptheta), radDist(phi, pphi)));
	const [index, dist] = distances.reduce((acc, d, i) => d < acc[1] ? [i, d] : acc, [0, Infinity]) as [number, number];
	return [index, dist, radDistances[index]];
}

const originalOrbit = (([name, theta, phi]) => `${theta}rad ${phi}rad auto`)(PREDEFINED_ORBITS[0]);

export const initViewer = () => {
	const modelViewerEl = document.getElementById("preview-model") as ModelViewerElement;
	const axesViewerEl = document.getElementById("model-axes") as ModelViewerElement;

	for (const el of [modelViewerEl, axesViewerEl]) {
		const otherEl = el === modelViewerEl ? axesViewerEl : modelViewerEl;
		function handleCameraChange(e: any) {
			if (e.detail.source === 'user-interaction') {
				const cameraOrbit = el.getCameraOrbit();
				cameraOrbit.radius = otherEl.getCameraOrbit().radius;
				otherEl.cameraOrbit = cameraOrbit.toString();
			}
		}
		el.addEventListener('camera-change', handleCameraChange);
		// return () => el.removeEventListener('camera-change', handleCameraChange);
	}
	axesViewerEl.setAttribute("camera-orbit", originalOrbit);
	modelViewerEl.setAttribute("camera-orbit", originalOrbit);

	// modelViewerEl.addEventListener("load", () => {

	// })
	modelViewerEl.addEventListener("error", (e) => {
		console.error("Model Viewer Error", e);
	})

	// Cycle through predefined views when user clicks on the axes viewer
	let mouseDownSpherePoint: [number, number, number] | undefined;
	function getSpherePoint() {
		const orbit = axesViewerEl.getCameraOrbit();
		return spherePoint(orbit.theta, orbit.phi);
	}
	function onMouseDown(e: MouseEvent) {
		if (e.target === axesViewerEl) {
			mouseDownSpherePoint = getSpherePoint();
		}
	}
	function onMouseUp(e: MouseEvent) {
		if (e.target === axesViewerEl) {
			const euclEps = 0.01;
			const radEps = 0.1;

			const spherePoint = getSpherePoint();
			const clickDist = mouseDownSpherePoint ? euclideanDist(spherePoint, mouseDownSpherePoint) : Infinity;
			if (clickDist > euclEps) {
				return;
			}
			// Note: unlike the axes viewer, the model viewer has a prompt that makes the model wiggle around, we only fetch it to get the radius.
			const axesOrbit = axesViewerEl.getCameraOrbit();
			const modelOrbit = axesViewerEl.getCameraOrbit();
			const [currentIndex, dist, radDist] = getClosestPredefinedOrbitIndex(axesOrbit.theta, axesOrbit.phi);
			const newIndex = dist < euclEps && radDist < radEps ? (currentIndex + 1) % PREDEFINED_ORBITS.length : currentIndex;
			const [name, theta, phi] = PREDEFINED_ORBITS[newIndex];
			Object.assign(modelOrbit, { theta, phi });
			const newOrbit = axesViewerEl.cameraOrbit = axesViewerEl.cameraOrbit = modelOrbit.toString();
			modelViewerEl.setAttribute("interaction-prompt", "none");
			modelViewerEl.setAttribute("camera-orbit", newOrbit);
		}
	}
	window.addEventListener('mousedown', onMouseDown);
	window.addEventListener('mouseup', onMouseUp);
	// return () => {
	//   window.removeEventListener('mousedown', onMouseDown);
	//   window.removeEventListener('mouseup', onMouseUp);
	// };

	const redraw = (uri: string) => {
		modelViewerEl.setAttribute("src", uri);
	}

	return redraw
}
