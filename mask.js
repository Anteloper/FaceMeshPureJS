video = document.querySelector("#videoElement");
let delta = 0.0;
var shaderProgram = ""

function startWebGL(){
    createWebGLContext();
    createShaderPrograms();
}

function createWebGLContext(){
    canvas = document.getElementById('draw_surface');
    gl = canvas.getContext('experimental-webgl');
}

function createShaderPrograms(){
    // vertex shader source code
    var vertCode =
    'precision mediump float; ' +
    'attribute vec3 a_Position; ' +
    'attribute vec3 a_Color; ' +
    'varying vec4 outColor; ' +
    'uniform float delta_x; ' +
    'uniform float angle; ' +


    'void main(void) { ' +
        'gl_Position = vec4(a_Position, 1.0); ' +    //Cast a_Position to a vec4
        'gl_Position.x = a_Position.x + delta_x; ' + //Update the xcomponent with delta_x
        'outColor = vec4(a_Color, 1.0); ' +
        'gl_PointSize = 1.0;' +

    '}';

    // fragment shader source code
    var fragCode =
    'precision mediump float; ' +
    'varying vec4 outColor; ' +

    'void main(void) { ' +
        'gl_FragColor = outColor; ' +
    '}';

    var vertShader = gl.createShader(gl.VERTEX_SHADER); // Create a vertex shader object
    gl.shaderSource(vertShader, vertCode); // Attach vertex shader source code
    gl.compileShader(vertShader);// Compile the vertex shader

    // Check for any compilation error
    if (!gl.getShaderParameter(vertShader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(vertShader));
        return null;
    }

    var fragShader = gl.createShader(gl.FRAGMENT_SHADER);// Create fragment shader object
    gl.shaderSource(fragShader, fragCode); // Attach fragment shader source code
    gl.compileShader(fragShader); // Compile the fragmentt shader

    if (!gl.getShaderParameter(fragShader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(fragShader));
        return null;
    }

    shaderProgram = gl.createProgram(); // Shader program object to store the combined shader program
    gl.attachShader(shaderProgram, vertShader);  // Attach a vertex shader
    gl.attachShader(shaderProgram, fragShader);  // Attach a fragment shader
    gl.linkProgram(shaderProgram); // Link both programs
    gl.useProgram(shaderProgram);
}

function getCoordinateDivisors(scaledMesh) {
    var divisors = {maxX: -10000000, maxY: -10000000, maxZ:-10000000,
                    minX: 10000000, minY: 10000000, minZ: 10000000,
                    rangeX: 0, rangeY:0, rangeZ: 0}

    for (let i = 0; i < 468; i++) {
        x = scaledMesh[i][0]
        y = scaledMesh[i][1]
        z = scaledMesh[i][2]
        if (x > divisors.maxX) {
            divisors.maxX = x
        }
        if (x < divisors.minX) {
            divisors.minX = x
        }
        if (y > divisors.maxY) {
            divisors.maxY = y
        }
        if (y < divisors.minY) {
            divisors.minY = y
        }
        if (z > divisors.maxZ) {
            divisors.maxZ = z
        }
        if (z < divisors.maxZ) {
            divisors.minZ = z
        }
    }
    divisors.rangeX = divisors.maxX - divisors.minX
    divisors.rangeY = divisors.maxY - divisors.minY
    divisors.rangeZ = divisors.maxZ - divisors.minZ
    return divisors
}

//TODO: Understand why points need to be negated to avoid inverting the mesh
//      Understand why 0.5 needs to be subtracted from each dimension to center it
//      Remove uneeded shader Code
//      Research best way to send new objects down to the vertex buffer
function drawObjects(scaledMesh){
    var meshPoints = []
    var colors = []
    var divisors = getCoordinateDivisors(scaledMesh);
    var whitePoints = [1.0, 1.0, 1.0]

    for (let i = 0; i < 468; i++) {
        var pointsRow = [-(scaledMesh[i][0] - divisors.minX) / divisors.rangeX + 0.5,
                         -(scaledMesh[i][1] - divisors.minY) / divisors.rangeY + 0.5,
                         -(scaledMesh[i][2] - divisors.minZ) / divisors.rangeZ + 0.5]
        var colorRow = pointsRow.map(value => Math.abs(0.6 - (value * -1)))

        meshPoints.push(...pointsRow)
        colors.push(...colorRow)
    }

    //For EVERY attribute
    //create buffer, bind buffer, buffer data, vertAttribPointer(), enableVertAttribPointer()
    vertex_buffer = gl.createBuffer(); // Create an empty buffer object to store the vertex buffer
    coord = gl.getAttribLocation(shaderProgram, "a_Position"); // Get the attribute location
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer); //Bind appropriate array buffer to it
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(meshPoints), gl.STATIC_DRAW);// Pass the vertex data to the buffer
    gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0); // Point an attribute to the currently bound VBO
    gl.enableVertexAttribArray(coord); // Enable the attribute

    color_buffer = gl.createBuffer();
    color = gl.getAttribLocation(shaderProgram, "a_Color");
    gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl. STATIC_DRAW);
    gl.vertexAttribPointer(color, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(color);

    gl.clearColor(0.0, 0.0, 0.0, 1.0);     // Clear the canvas
    gl.enable(gl.DEPTH_TEST); // Enable the depth test
    gl.clear(gl.COLOR_BUFFER_BIT); // Clear the color buffer bit


    gl.useProgram(shaderProgram); // use the program I created/compiled and Linked
    gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer); // bind the buffer you wrote your vertices to
    gl.enableVertexAttribArray(coord); // enable the attribute on the GPU
    gl.vertexAttribPointer(coord, 3, gl.FLOAT, false, 0, 0);  // set up the attribute pointer (for us this is a_Position in vertex shader)

    gl.bindBuffer(gl.ARRAY_BUFFER, color_buffer);
    gl.vertexAttribPointer(color, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(color);

    gl.uniform1f(gl.getUniformLocation(shaderProgram, 'delta_x'), delta); // stores value of delta into delta_x on GPU
    gl.drawArrays(gl.POINTS, 0, 468); // execute the vertex/fragment shader on the bounded buffer, using the
    // using the shaders compiled/linked and attached to gpuProgram
}



if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(function (stream) {
            video.srcObject = stream;
        })
        .catch(function (error) {
            console.log("Not able to stream from your camera");
        });
}


async function mapVideo(iteration) {// Load the MediaPipe facemesh model assets.
    const model = await facemesh.load();

    // Pass in a video stream to the model to obtain
    // an array of detected faces from the MediaPipe graph.
    const video = document.querySelector("video");
    console.log(video)
    const faces = await model.estimateFaces(video);
    drawObjects(faces[0].scaledMesh)
}

function getMap() {
    mapVideo()
}

function btn(){
    setInterval(() => {
        getMap()
    }, 100);
}
