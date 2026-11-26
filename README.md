# RDM AI Office

Isometric 3D miniature AI office (Three.js / React Three Fiber). Three agents walk around, sit at their desks, and chat with you.
Connect each agent to an **n8n webhook** or to a **free OpenRouter model** from the Settings screen. No keys or URLs live in the code.

## Run
```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static site in dist/ (deploy to Vercel, Netlify, GitHub Pages)
```

## Controls
- Click an agent (3D robot) to select it, click the floor (or use WASD / arrow keys, relative to the room) to walk it around.
- Drag the vertical splitter to resize the chat. Double-click it to reset.
- Drag to orbit the diorama, scroll to zoom. The ISO VIEW / TOP VIEW button switches between the 35 degree isometric camera and a near top-down camera.
- Mobile: bottom tabs switch between Office and Chat.

## Agent states (drive the animation)
| State | Look |
|---|---|
| idle | sits at desk |
| thinking | sits, "..." bubble |
| working | stands, walks to servers / shelf / copier / cooler, "Analyzing" bubble |
| error | red bubble, server LEDs turn red, then back to idle |

## Settings
**OpenRouter (free):** paste your key, press FETCH FREE MODELS, choose a model per agent (model ids ending in `:free`), press TEST CONNECTION.
**n8n:** choose "n8n webhook" for an agent, paste the Production webhook URL, add an auth header if the Webhook node uses Header Auth.

### n8n contract
Request (POST JSON):
```json
{ "message": "...", "agent": "finance", "department": "Finance & Analytics",
  "conversation": "uuid", "history": [{"role":"user|agent","content":"..."}], "timestamp": "ISO" }
```
Response (any of): `{ "output": "..." }`, `{ "reply": "..." }`, `{ "message": "..." }`, `[{ "output": "..." }]` or plain text.
Optional `"status": "idle|thinking|working|error"` in the response sets the agent animation.

Import `n8n/rdm-agent-workflow.json` for a working echo endpoint, then place your AI Agent / LLM nodes between Webhook and Respond.
In the Webhook node, Options > Allowed Origins (CORS) must be `*` (or your site URL), otherwise the browser blocks the call.

## Notes
- The OpenRouter key is stored in your browser's localStorage and sent straight to openrouter.ai. For a shared or public deployment route agents through n8n instead, so the key stays on the server.
- Free models change often; use FETCH FREE MODELS to see what is available today.
- Everything in the 3D office is real geometry built in code (`src/office3d/`): PBR materials, soft shadows, contact shadows, ambient occlusion (N8AO), a reflective floor and bloom on the cyan accents. If a laptop struggles, lower quality in `Scene.tsx` (remove `N8AO` or `ContactShadows`, set `dpr={1}`).
- Want your own model? Export a GLB and load it with drei's `useGLTF` in place of `<Room />`; keep the agents and the walkable grid in `src/office/map.ts`.

## Structure
```
src/office/   map.ts (walkable grid) · pathfinding.ts · engine.ts (agent simulation, no rendering)
src/office3d/ Scene · Room · Furniture · Agent3D · textures (all Three.js geometry)
src/components/  OfficeCanvas · ChatPanel · SettingsDialog
src/api.ts    n8n + OpenRouter calls     src/store.ts  settings and chat persistence
```
