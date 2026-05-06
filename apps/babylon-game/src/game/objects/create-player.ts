import {
	Color3,
	Mesh,
	MeshBuilder,
	Ray,
	Scene,
	StandardMaterial,
	Vector3,
} from "@babylonjs/core";

export interface PlayerActor {
	mesh: Mesh;
	spawnPoint: Vector3;
	getVerticalVelocity(): number;
	setVerticalVelocity(nextValue: number): void;
	isGrounded(): boolean;
	reset(): void;
}

export function createPlayer(scene: Scene): PlayerActor {
	const mesh = MeshBuilder.CreateCapsule(
		"player",
		{
			height: 1.6,
			radius: 0.4,
			tessellation: 8,
		},
		scene,
	);
	mesh.position = new Vector3(0, 1.1, 0);
	mesh.checkCollisions = true;
	mesh.isPickable = false;
	mesh.ellipsoid = new Vector3(0.45, 0.8, 0.45);
	mesh.ellipsoidOffset = new Vector3(0, 0.8, 0);

	const material = new StandardMaterial("player-material", scene);
	material.diffuseColor = new Color3(0.09, 0.55, 0.96);
	material.emissiveColor = new Color3(0.02, 0.08, 0.14);
	mesh.material = material;

	const spawnPoint = mesh.position.clone();
	let verticalVelocity = 0;

	return {
		mesh,
		spawnPoint,
		getVerticalVelocity() {
			return verticalVelocity;
		},
		setVerticalVelocity(nextValue: number) {
			verticalVelocity = nextValue;
		},
		isGrounded() {
			const ray = new Ray(mesh.position.add(new Vector3(0, 0.1, 0)), Vector3.Down(), 1.15);
			const hit = scene.pickWithRay(ray, (candidate) => candidate.isPickable && candidate !== mesh);
			return Boolean(hit?.hit);
		},
		reset() {
			mesh.position.copyFrom(spawnPoint);
			verticalVelocity = 0;
		},
	};
}
