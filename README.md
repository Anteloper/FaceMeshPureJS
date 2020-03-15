## Vanilla JavaScript Attempt

This repo is an attempt to render real-time meshes, just like the [facemesh demo](https://storage.googleapis.com/tfjs-models/demos/facemesh/index.html)

The structure is a simple HTML index page that links out to the facemesh API through script tags. Initially, I thought that this outbound link was the reason that each model inference was generating a network call, so I went to the link source and manually copied and pasted the source into this project.

Evidently, that did not change the fact that network calls were made for each inference. Concluding that the issue was that the model itself was not actually on board the browser, I created a [separate project]() which calls the facemesh API via node imports, hoping that this would eliminate network calls. It did not.
