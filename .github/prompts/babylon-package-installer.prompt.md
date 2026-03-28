---
mode: 'agent'
description: 'Install Babylon Toolkit Project Files'
---

Your goal is setup and install babylon.js workspace projects

## 📦 External Dependencies

Use Babylon Toolkit and Babylon.js as follows:

### Babylon.js (WEB/CDN)

Include:

```html
<script src="https://cdn.babylonjs.com/babylon.js"></script>
<script src="https://cdn.babylonjs.com/gui/babylon.gui.min.js"></script>
<script src="https://cdn.babylonjs.com/loaders/babylonjs.loaders.min.js"></script>
<script src="https://cdn.babylonjs.com/materialsLibrary/babylonjs.materials.min.js"></script>
```

### Babylon Toolkit Runtime (WEB/CDN)

```html
<script src="https://cdn.jsdelivr.net/gh/BabylonJS/BabylonToolkit@master/Runtime/babylon.toolkit.js"></script>
```

### Babylon Toolkit Declarations (WEB/CDN)

- `https://cdn.babylonjs.com/babylon.d.ts`
- `https://cdn.babylonjs.com/gui/babylon.gui.d.ts`
- `https://cdn.babylonjs.com/loaders/babylonjs.loaders.d.ts`
- `https://cdn.babylonjs.com/materialsLibrary/babylonjs.materials.d.ts`
- `https://cdn.jsdelivr.net/gh/BabylonJS/BabylonToolkit@master/Runtime/babylon.toolkit.d.ts`

### Node.js Package Guidance

#### UMD

- Default Installation (UMD)

```bash
npm install babylonjs babylonjs-gui babylonjs-loaders babylonjs-materials navcat babylonjs-toolkit
```

- Global Import Side Effects (main.tsx)

```javascript
import 'navcat';
import 'babylonjs';
import 'babylonjs-gui';
import 'babylonjs-loaders';
import 'babylonjs-materials';
import 'babylonjs-inspector';
import 'babylonjs-toolkit';
```

- TypeScript Configuration Settings (tsconfig.json)

```json
"types": [
    "navcat",
    "babylonjs",
    "babylonjs-gui",
    "babylonjs-loaders",
    "babylonjs-gltf2interface",
    "babylonjs-materials",
    "babylonjs-inspector",
    "babylonjs-toolkit"
]
```

Note: This bootstraps the **BABYLON** and **TOOLKIT** libraries and makes the namespaces globally accessible.

#### ES6

- Default Installation (ES6)

```bash
npm install @babylonjs/core @babylonjs/gui @babylonjs/loaders @babylonjs/materials @babylonjs/havok navcat @babylonjs-toolkit/next
```

- Default Module Import Libraries

```javascript
import { Engine, Scene } from '@babylonjs/core';
import { HavokPlugin } from '@babylonjs/core/Physics/v2/Plugins/havokPlugin';
import HavokPhysics from '@babylonjs/havok';
import { SceneManager, ScriptComponent } from '@babylonjs-toolkit/next';
```

- Granular File Level Import Libraries

```javascript
import { Engine } from '@babylonjs/core/Engines/engine';
import { Scene } from '@babylonjs/core/scene';
import { HavokPlugin } from '@babylonjs/core/Physics/v2/Plugins/havokPlugin';
import HavokPhysics from '@babylonjs/havok';
import { SceneManager } from '@babylonjs-toolkit/next/scenemanager';
import { ScriptComponent } from '@babylonjs-toolkit/next/scenemanager';
import { LocalMessageBus } from '@babylonjs-toolkit/next/localmessagebus';
import { CharacterController } from '@babylonjs-toolkit/next/charactercontroller';
```

- Legacy Global Namespace Import Libraries

```javascript
import * as BABYLON from '@babylonjs/core/Legacy/legacy';
import { HavokPlugin } from '@babylonjs/core/Physics/v2/Plugins/havokPlugin';
import HavokPhysics from '@babylonjs/havok';
import * as TOOLKIT from '@babylonjs-toolkit/next';
TOOLKIT.SceneManager.AutoStripNamespacePrefix = false;
```

### Vite Configuration (ES6)

The Vite bundle services behave differently in devmode than production. To preserve some required classes during devmode, these `exclude` and `include` settings are strongly recommended in your vite.config.js settings file.

```json
  optimizeDeps: {
    exclude: mode === 'development' ? [
      "@babylonjs/havok",
      "@babylonjs/core",
      "@babylonjs/loaders",
      "@babylonjs/loaders/glTF",
    ] : ["@babylonjs/havok"],
    include: mode === 'development' ? [
      "@babylonjs/gui",
      "@babylonjs/materials",
      "@babylonjs/inspector",
      "@babylonjs-toolkit/dlc",
      "@babylonjs-toolkit/next"
    ] : [],
  },
```

#### DLC

- Starter Content Package (ES6)

```bash
npm install @babylonjs-toolkit/dlc
```

- Starter Content Import Libraries

```javascript
import { DefaultCameraSystem } from '@babylonjs-toolkit/dlc/starter/DefaultCameraSystem';
import { DebugInformation } from '@babylonjs-toolkit/dlc/starter/DebugInformation';
import { StandardCarController } from '@babylonjs-toolkit/dlc/racing/StandardCarController';
```

### Babylon Toolkit Starter Repositories

- **CDN Starter Assets**: `https://github.com/MackeyK24/CDN-StarterAssets.git`
- **UMD Starter Assets**: `https://github.com/MackeyK24/UMD-StarterAssets.git`
- **ES6 Starter Assets**: `https://github.com/MackeyK24/ES6-StarterAssets.git`
- **Next.js Starter Assets**: `https://github.com/MackeyK24/NJS-StarterAssets.git`

### Babylon Toolkit Content Creation Tools

The **Babylon Toolkit Unity Exporter** (https://github.com/BabylonJS/BabylonToolkit/tree/master/Editors/Unity) is a **Content Creation Tool** used to export interactive
scene files with extra UnityGLTF metadata to instantiate **Babylon Toolkit Script Components** classes that have be encoded as **extras**.

### Babylon Toolkit React Component Framework

The **Babylon Toolkit Scene Viewer** is packaged in the starter repos to render interactive scenes as a routes:

```
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/play" element={
          <ApplicationRoute allowDevMode={true}>
            <BabylonSceneViewer rootPath="/scenes/" sceneFile="mainmenu.gltf" allowQueryParams={true} enableCustomOverlay={false} />
          </ApplicationRoute>} />
      </Routes>
    </BrowserRouter>
  )
}
```

React router navigation can be used to load scenes from **anywhere**:

```
navigate("/play", { state: { fromApp: true, rootPath: "/scenes/", sceneFile: "levelone.gltf" } });
```

or load a blank scene at runtime and handle creation in code:

```
navigate("/play", { state: { fromApp: true, sceneFile: "_blank", auxiliaryData: "anything" } });
```

### Important Front End Project Create Notes

These instructions are **ONLY** for generating **FRONT END** web applications to host our Babylon Toolkit interactive scenes.

- You must create a comprehensive web application with ALL the required user interfaces using VITE, REACT and TYPESCRIPT.
- The app should use the specified **HTML UI Template** or default to Tailwind CSS if not specified.
- The app should have a `Main Menu` home page type feel and support user presence and login.
- The app should have some FILLER content like `User Achievements` and `Leaderboards`, etc.

### Babylon Toolkit Project Installation

- Always include the `babylon toolkit` dependency for Babylon.js projects
- Always install the @latest version of Babylon.js and Babylon Toolkit for **new** node.js projects.
- Create **standard babylon.js demo scene** that has a light, a free camera, a sphere and a ground (no physics) with default import libraries as `demo` code when creating non cloned projects
- Use **CDN Starter Assets** as the default `starter repo` unless specified otherwise
- Use **ES6** module format for node.js projects unless specified otherwise
- Do **not** write WEB/CDN html script tags for node.js projects
- Do **not** create `babylon toolkit` script components as `starter` code
- Do **not** run `npm install latest` after **cloning** starter assets repo
- Always **detach** and remove `.git` folder after cloning one of the default `starter repos`
- Never **overwrite** the `.github/copilot-instructions.md`

---
