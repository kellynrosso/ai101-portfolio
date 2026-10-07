# AI 101 — CesiumJS Flight Lab

This is an original teaching starter: a steerable moving point, not a realistic aircraft simulator.

## Run
Upload all files in this folder to the root of a public GitHub repository. In Settings → Pages choose Deploy from a branch, main, /(root). Open the site URL after deployment. Alternatively serve this folder with your editor's local web server. If Python is already installed: `python -m http.server 8000`, then open http://localhost:8000.

Internet and WebGL are required. CesiumJS 1.145 and its matching CSS load from Cesium's CDN. No build step, Node installation, ion token, imagery service, or paid data is needed. Keep Cesium's on-screen credits visible.

## Controls
Fly starts motion; Pause stops it. Left/Right change heading by 10 degrees. Speed is 0–250 meters/second; height is 50–5000 meters above the model ellipsoid. Height changes instantly: this starter does not simulate climbing. Reset restores the paused initial state. Switching to another browser tab pauses the app. On returning, press Fly again. The camera follows while flying.

## Test
Open tests.html on the same site. Also perform the six manual checks on Canvas page 05. Optional developer command: `node -e "require('./flight-core.js');require('./tests.js')"`.

## Model and geography
Uses spherical destination-point math with Earth radius 6,371,000 m, displayed on Cesium's ellipsoid globe. This approximation is for learning. Heading remains constant between clicks. Frame dt is capped at 0.1 s to prevent large jumps after stalls, so low frame rates can slow simulated time. There is no lift, drag, bank, pitch, collision, real terrain, flight data, or navigation accuracy. The marker is a point, not an aircraft model. Grid lines provide visual reference, not roads.
The approximate origin (-75.93, 40.33) is a Reading-area classroom reference, not a verified Alvernia campus location. Validate real location claims separately.

## Psychology adaptation
Pitch: I want to help psychology students compare their impressions of slower and faster movement using simulated position and speed data. Before sharing, I will verify that the controls match the displayed speed, the movement tests pass, and the origin is clearly labeled as an approximate teaching reference.

Feature: Slow Observation sets speed to 20 m/s and updates the speed input and readout. It preserves the current position, heading, height, and paused/flying state. Click Fly separately if paused. Reset returns speed to 70 m/s. The activity is exploratory, not a validated psychological assessment.

## Exact local run steps
1. Extract this ZIP. Open a terminal in the extracted Flight_Lab folder, the folder containing index.html.
2. With Python 3 installed, run `python3 -m http.server 8000` (Windows: `py -m http.server 8000`). Keep the terminal open.
3. Visit http://localhost:8000/index.html in a WebGL-capable browser with internet access. Do not double-click the HTML file.
4. Check for the grid globe and paused message. Record a screenshot as your rendered checkpoint.
5. Visit http://localhost:8000/tests.html and capture the seven results.
6. Stop the server with Ctrl+C. If port 8000 is occupied, use 8001 in both the command and URLs.

Dependency: the original starter pins CesiumJS and Widgets CSS to version 1.145. That version was preserved. CDN loading and rendering still require browser verification; Node tests do not verify them.

## Testing completed by AI assistant, 2026-10-05
The original movement code passed all seven provided tests in Node. This is a code checkpoint, not a successful WebGL checkpoint. After the UI change, all seven passed again. JavaScript syntax checks passed. See evidence/*.txt. tests.html itself has not been opened in a browser here. The new button needs manual browser verification.

Break/repair: temporarily replaced `const distance = state.speed * dt;` with `const distance = state.speed;`. Six tests passed; duration consistency failed. At dt=0.1, the broken formula moves 70 meters per step instead of 7 at the default speed. Restored `* dt`, then all seven passed. The submitted flight-core.js is repaired.

## API/geographic care
Checked official documentation on 2026-10-05:
https://cesium.com/learn/cesiumjs/ref-doc/Cartesian3.html
`fromDegrees` takes longitude, latitude, and height above the ellipsoid in meters. The app uses that order and labels its height accordingly.
https://cesium.com/learn/cesiumjs/ref-doc/Viewer.html
`baseLayer:false` disables the default imagery layer when baseLayerPicker is false, matching the starter configuration. This documentation review does not establish that the pinned CDN loaded successfully.
The origin is an approximate Reading-area teaching reference, not a verified campus location. No new real-location claim was added.

## Limitations
No real aircraft physics, terrain, collision detection, or validated psychological measurement. Capped frame timing can slow simulated time on low-performance devices. Do not draw research conclusions from this activity. No psychological responses are saved or transmitted by this project.

## Finish before submitting
See Finish_Checklist.md. Replace pending results in Test_Log.csv with actual observations and evidence. The Canvas pages containing the warm-up and exact six manual checks were not supplied. The six suggested checks are provisional and must be matched to the instructor's checklist. Partner feedback and a resulting improvement are not yet completed. The reflection is an AI-written draft to personalize after doing the remaining steps.

## AI choices and partner review
AI proposed and implemented the Slow Observation button and prepared the evidence and documents. Student acceptance/rejection: pending personal review; complete AI_Excerpts.md. Partner name/date, run outcome, feedback, and resulting improvement: pending; complete Finish_Checklist.md. No partner result is claimed.
