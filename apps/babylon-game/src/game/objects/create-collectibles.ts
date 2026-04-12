import {
	Color3,
	Mesh,
	MeshBuilder,
	Scene,
	StandardMaterial,
	Vector3,
} from "@babylonjs/core";

import type { CollectiblePalette } from "@/game/scenarios/scenario-model";

export interface CollectibleLayoutConfig {
	positions?: ReadonlyArray<readonly [number, number, number]>;
	labelPrefix?: string;
	palette?: CollectiblePalette;
}

export interface CollectibleItem {
	mesh: Mesh;
	material: StandardMaterial;
	label: string;
	baseY: number;
	collected: boolean;
	active: boolean;
	palette: CollectiblePalette;
}

export interface CollectibleSet {
	items: CollectibleItem[];
	configureLayout(config?: CollectibleLayoutConfig): void;
	activeCount(): number;
	animate(timeSeconds: number): void;
	highlightNearby(position: Vector3, radiusMultiplier?: number): CollectibleItem | null;
	collectFocused(position: Vector3, radiusMultiplier?: number): CollectibleItem | null;
	collectedCount(): number;
	reset(): void;
}

const DEFAULT_POSITIONS: ReadonlyArray<readonly [number, number, number]> = [
	[3, 1.1, 2],
	[-4, 1.1, -1],
	[2, 1.1, -4],
];
const DEFAULT_LABEL_PREFIX = "Energiering";
const DEFAULT_PALETTE: CollectiblePalette = "gold";

const PALETTE_PRESETS: Record<CollectiblePalette, {
	diffuse: Color3;
	defaultEmissive: Color3;
	highlightEmissive: Color3;
}> = {
	gold: {
		diffuse: new Color3(1, 0.72, 0.18),
		defaultEmissive: new Color3(0.35, 0.16, 0.02),
		highlightEmissive: new Color3(0.08, 0.8, 1),
	},
	violet: {
		diffuse: new Color3(0.78, 0.54, 1),
		defaultEmissive: new Color3(0.22, 0.08, 0.38),
		highlightEmissive: new Color3(0.4, 1, 0.92),
	},
};
const INTERACTION_RADIUS = 1.6;

function toVector3([x, y, z]: readonly [number, number, number]) {
	return new Vector3(x, y, z);
}

function createItem(scene: Scene, index: number): CollectibleItem {
	const material = new StandardMaterial(`collectible-material-${index}`, scene);
	const palette = PALETTE_PRESETS[DEFAULT_PALETTE];
	material.diffuseColor.copyFrom(palette.diffuse);
	material.emissiveColor.copyFrom(palette.defaultEmissive);

	const mesh = MeshBuilder.CreateTorus(
		`collectible-${index}`,
		{
			diameter: 0.55,
			thickness: 0.18,
			tessellation: 20,
		},
		scene,
	);
	mesh.material = material;
	mesh.isPickable = false;

	return {
		mesh,
		material,
		label: `${DEFAULT_LABEL_PREFIX} ${index + 1}`,
		baseY: 1.1,
		collected: false,
		active: true,
		palette: DEFAULT_PALETTE,
	};
}

function applyLayout(
	items: CollectibleItem[],
	scene: Scene,
	config: CollectibleLayoutConfig = {},
) {
	const positions = config.positions?.length ? config.positions : DEFAULT_POSITIONS;
	const labelPrefix = config.labelPrefix?.trim() || DEFAULT_LABEL_PREFIX;
	const paletteName = config.palette ?? DEFAULT_PALETTE;
	const palette = PALETTE_PRESETS[paletteName];

	positions.forEach((rawPosition, index) => {
		const item = items[index] ?? createItem(scene, index);
		if (!items[index]) {
			items.push(item);
		}

		const position = toVector3(rawPosition);
		item.active = true;
		item.collected = false;
		item.palette = paletteName;
		item.label = `${labelPrefix} ${index + 1}`;
		item.baseY = position.y;
		item.mesh.position.copyFrom(position);
		item.mesh.setEnabled(true);
		item.mesh.scaling.setAll(1);
		item.material.diffuseColor.copyFrom(palette.diffuse);
		item.material.emissiveColor.copyFrom(palette.defaultEmissive);
	});

	for (let index = positions.length; index < items.length; index += 1) {
		const item = items[index];
		if (!item) {
			continue;
		}

		item.active = false;
		item.collected = false;
		item.mesh.setEnabled(false);
		item.mesh.scaling.setAll(1);
		item.material.emissiveColor.copyFrom(PALETTE_PRESETS[item.palette].defaultEmissive);
	}
}

export function createCollectibles(
	scene: Scene,
	config: CollectibleLayoutConfig = {},
): CollectibleSet {
	const items: CollectibleItem[] = [];
	applyLayout(items, scene, config);

	return {
		items,
		configureLayout(nextConfig = {}) {
			applyLayout(items, scene, nextConfig);
		},
		activeCount() {
			return items.filter((item) => item.active).length;
		},
		animate(timeSeconds) {
			for (const [index, item] of items.entries()) {
				if (!item.active || item.collected) {
					continue;
				}

				item.mesh.rotation.y += 0.03;
				item.mesh.position.y = item.baseY + Math.sin(timeSeconds * 2 + index) * 0.12;
			}
		},
		highlightNearby(position, radiusMultiplier = 1) {
			let focused: CollectibleItem | null = null;
			let nearestDistance = INTERACTION_RADIUS * radiusMultiplier;

			for (const item of items) {
				if (!item.active || item.collected) {
					item.material.emissiveColor.copyFrom(PALETTE_PRESETS[item.palette].defaultEmissive);
					item.mesh.scaling.setAll(1);
					continue;
				}

				const distance = Vector3.Distance(position, item.mesh.position);
				if (distance <= nearestDistance) {
					focused = item;
					nearestDistance = distance;
				}
			}

			for (const item of items) {
				if (!item.active || item.collected) {
					continue;
				}

				const isFocused = focused?.mesh === item.mesh;
				const palette = PALETTE_PRESETS[item.palette];
				item.material.emissiveColor.copyFrom(
					isFocused ? palette.highlightEmissive : palette.defaultEmissive,
				);
				item.mesh.scaling.setAll(isFocused ? 1.18 : 1);
			}

			return focused;
		},
		collectFocused(position, radiusMultiplier = 1) {
			const focused = this.highlightNearby(position, radiusMultiplier);
			if (!focused) {
				return null;
			}

			focused.collected = true;
			focused.mesh.setEnabled(false);
			focused.mesh.scaling.setAll(1);
			focused.material.emissiveColor.copyFrom(PALETTE_PRESETS[focused.palette].defaultEmissive);
			return focused;
		},
		collectedCount() {
			return items.filter((item) => item.active && item.collected).length;
		},
		reset() {
			for (const item of items) {
				if (!item.active) {
					item.mesh.setEnabled(false);
					continue;
				}

				item.collected = false;
				item.mesh.setEnabled(true);
				item.mesh.position.y = item.baseY;
				item.mesh.scaling.setAll(1);
				item.material.diffuseColor.copyFrom(PALETTE_PRESETS[item.palette].diffuse);
				item.material.emissiveColor.copyFrom(PALETTE_PRESETS[item.palette].defaultEmissive);
			}
		},
	};
}
