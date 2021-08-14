let m = glMatrix.mat4.create();
let gl
var now
var rot = 0.0*Math.PI/180

/* @class Camera */
class Camera{
  positionVector
  upVector
  sideVector
  targetVector
  viewDirectionVector
  cameraMatrix
  delta = 0.25
  constructor(){
    this.cameraMatrix = glMatrix.mat4.create()
    this.viewDirectionVector = glMatrix.vec3.fromValues(0.0, 0.0, -1.0)
    this.upVector = glMatrix.vec3.fromValues(0.0, 1.0, 0.0)
    this.sideVector = glMatrix.vec3.fromValues(1.0, 0.0, 0.0)
    this.targetVector = glMatrix.vec3.fromValues(0.0, 0.0, 0.0)
    this.positionVector = glMatrix.vec3.fromValues(0.0, 0.0, 0.0)
  }

  /* Camera movement functions*/
  moveForward(){
    let deltaForward = glMatrix.vec3.create();
    glMatrix.vec3.scale(deltaForward, this.viewDirectionVector, this.delta);
    glMatrix.vec3.add(this.positionVector, this.positionVector, deltaForward);
    this.updateCameraMatrix();
  }
  moveBackward(){
    let deltaForward = glMatrix.vec3.create();
    glMatrix.vec3.scale(deltaForward, this.viewDirectionVector, this.delta);
    glMatrix.vec3.sub(this.positionVector, this.positionVector, deltaForward);
    this.updateCameraMatrix();
  }
  strafeRight(){
    let newAxis = glMatrix.vec3.create();
    glMatrix.vec3.cross(newAxis, this.viewDirectionVector, this.upVector);
    glMatrix.vec3.scale(newAxis, newAxis, this.delta);
    glMatrix.vec3.add(this.positionVector, this.positionVector, newAxis);
    this.updateCameraMatrix();
  }
  strafeLeft(){
    let newAxis = glMatrix.vec3.create();
    glMatrix.vec3.cross(newAxis, this.viewDirectionVector, this.upVector);
    glMatrix.vec3.scale(newAxis, newAxis, this.delta);
    glMatrix.vec3.sub(this.positionVector, this.positionVector, newAxis);
    this.updateCameraMatrix();
  }
  moveUp(){
    let newAxis = glMatrix.vec3.create();
    glMatrix.vec3.cross(newAxis, this.viewDirectionVector, this.sideVector);
    glMatrix.vec3.scale(newAxis, newAxis, this.delta);
    glMatrix.vec3.add(this.positionVector, this.positionVector, newAxis);
    this.updateCameraMatrix();
  }
  moveDown(){
    let newAxis = glMatrix.vec3.create();
    glMatrix.vec3.cross(newAxis, this.viewDirectionVector, this.sideVector);
    glMatrix.vec3.scale(newAxis, newAxis, this.delta);
    glMatrix.vec3.sub(this.positionVector, this.positionVector, newAxis);
    this.updateCameraMatrix();
  }
  rotateRight(){
    let newAxis = glMatrix.vec3.create();
    glMatrix.vec3.cross(newAxis, this.viewDirectionVector, this.upVector);
    glMatrix.vec3.scale(newAxis, newAxis, this.delta);
    glMatrix.vec3.add(this.viewDirectionVector, this.viewDirectionVector, newAxis);
    this.updateCameraMatrix();
  }
  rotateLeft(){
    let newAxis = glMatrix.vec3.create();
    glMatrix.vec3.cross(newAxis, this.viewDirectionVector, this.upVector);
    glMatrix.vec3.scale(newAxis, newAxis, this.delta);
    glMatrix.vec3.sub(this.viewDirectionVector, this.viewDirectionVector, newAxis);
    this.updateCameraMatrix();
  }
  updateCameraMatrix(){
    let deltaMove = glMatrix.vec3.create();
    glMatrix.vec3.add(deltaMove, this.positionVector, this.viewDirectionVector);
    glMatrix.mat4.lookAt(this.cameraMatrix, this.positionVector, deltaMove, this.upVector);
  }
}
let camera = new Camera()
document.addEventListener("keydown", ProcessKeyPressedEvent, false)

/*@param e key press*/
function ProcessKeyPressedEvent(e){
  if(e.code === "KeyW"){
    console.log("^^^^--Forward")
    camera.moveForward()
  }
  if(e.code === "KeyS"){
    console.log("vvvvv--Backward")
    camera.moveBackward()
  }
  if(e.code === "KeyA"){
    console.log("<<<--Strafe Left")
    camera.strafeLeft()
  }
  if(e.code === "KeyD"){
    console.log(">>--Strafe Right")
    camera.strafeRight()
  }
  if(e.code === "KeyI"){
    console.log("^^--Up")
    camera.moveDown()
  }
  if(e.code === "KeyK"){
    console.log("vvv--Down")
    camera.moveUp()
  }
  if(e.code === "KeyJ"){
    console.log("<<--Rotate Left")
    camera.rotateLeft()
  }
  if(e.code === "KeyL"){
    console.log(">>--Rotate Right")
    camera.rotateRight()
  }
  console.log(e)
  mainWebGL();
}

/*@function  mainWebGl */
function mainWebGL(){
  const canvas = document.getElementById('draw_surface')
  gl = canvas.getContext('webgl2')
  if (!gl) {
    alert('Unable to initialize WebGL. Your browser or machine may not support it.');
    return;
  }

  /* vertex shader program*/
  const vertex = `#version 300 es
    in vec3 vertPosition;
    in vec3 vertNormal;
    
    uniform mat4 projMatrix;
    uniform mat4 modelToWorldMatrix;
    uniform mat4 viewMatrix;
    uniform mat4 uNormalMatrix;
    
    uniform vec3 uColor;
    uniform vec3 uDiffuseLightColor;
    uniform vec3 uDiffuseLightDirection;
    uniform vec3 uAmbientLightColor;
    
    out vec4 passToFragColor;
    
    void main(void) {
      gl_Position = projMatrix * viewMatrix * modelToWorldMatrix*vec4(vertPosition, 1.0);
      vec3 normal = normalize(vec3((transpose(inverse(modelToWorldMatrix)))*vec4(vertNormal, 0.0)));
      vec3 LightDir = normalize(uDiffuseLightDirection);
      float cosTheta = max(dot(LightDir, normal), 0.0);
      vec3 diffuseReflection = uDiffuseLightColor *uColor*cosTheta;
      vec3 ambientReflection = uAmbientLightColor *uColor;
      passToFragColor = vec4(ambientReflection + diffuseReflection, 1.0);
    }
  `;
  
  /*fragment shader*/
  const frag = `#version 300 es
  precision mediump float;
    in vec4 passToFragColor;
    out vec4 fragColor;
    void main(void) {
      fragColor = passToFragColor;
    }
  `;
  
  
  const shaderProgram = initShaderProgram(gl, vertex, frag);
  const buffers = initBuffers(gl, shaderProgram);

  drawModel(buffers, gl, shaderProgram);
}

/*function drawModel 
* @param om buffer object
* @param gl canvas object
* @param gpu shader program
*/
function drawModel(om, gl, gpu){
  requestAnimationFrame(drawLoop);
  
  /*@function drawLoop 
  * @param now time (double)
  */
  function drawLoop(now){
    now *= 0.0001;
    gl.useProgram(gpu)

    gl.clearColor(0.0, 0.0, 0.0, 1.0);  
    gl.clearDepth(1.0);            
    gl.enable(gl.DEPTH_TEST);          
    gl.depthFunc(gl.LEQUAL);            
  
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);


    gl.bindBuffer(gl.ARRAY_BUFFER, om.vertexBufferObject)
    gl.vertexAttribPointer(om.vertexPositionAttribLocation, 3, gl.FLOAT, gl.FALSE, 0, 0)
    gl.enableVertexAttribArray(om.vertexPositionAttribLocation)

    gl.bindBuffer(gl.ARRAY_BUFFER, om.normalBufferObject)
    gl.vertexAttribPointer(om.normalPositionAttribLocation, 3, gl.FLOAT, gl.FALSE, 0, 0)
    gl.enableVertexAttribArray(om.normalPositionAttribLocation)

    let uAmbientColorLocation = gl.getUniformLocation(gpu, 'uAmbientLightColor')
    gl.uniform3fv(uAmbientColorLocation, [0.2, 0.7, 0.2])

    let uDiffuseColorLocation = gl.getUniformLocation(gpu, 'uDiffuseLightColor')
    gl.uniform3fv(uDiffuseColorLocation, [1.0, 1.0, 1.0])

    let uDiffuseDirectionLocation = gl.getUniformLocation(gpu, 'uDiffuseLightDirection')
    gl.uniform3fv(uDiffuseDirectionLocation, [5.0, 5.0, 5.0])

    let ucolorLocation = gl.getUniformLocation(gpu, 'uColor')
    gl.uniform3fv(ucolorLocation, [1.0, 1.0, 0.0])

    let projMatrix = glMatrix.mat4.create()
    let projMatrixLocation = gl.getUniformLocation(gpu, 'projMatrix')

    glMatrix.mat4.perspective(projMatrix, Math.PI/180*60, 800/600, 0.1, 100.0)
    gl.uniformMatrix4fv(projMatrixLocation, false, projMatrix)

    let modelMatrix = glMatrix.mat4.create()
    let modelMatrixLocation = gl.getUniformLocation(gpu, 'modelToWorldMatrix')

    glMatrix.mat4.translate(modelMatrix, modelMatrix, [0.0, 0.0, -2.0])
    glMatrix.mat4.rotate(modelMatrixLocation, modelMatrix, 0.0*Math.PI/180, [0.0, 1.0, 0.0])
    glMatrix.mat4.rotate(modelMatrix, modelMatrix, now, [0.0, 1.0, 0.0])
    glMatrix.mat4.scale(modelMatrix, modelMatrix, [.5, .5, .5])

    gl.uniformMatrix4fv(modelMatrixLocation, false, modelMatrix)

    let viewMatrix = glMatrix.mat4.create()
    glMatrix.mat4.lookAt(viewMatrix, [-2.0, 0.0, -2.0], [1.0, 0.0, 0.0], [0.0, 1.0, 0.0])

    let viewMatrixLocation = gl.getUniformLocation(gpu, 'viewMatrix')
    gl.uniformMatrix4fv(viewMatrixLocation, false, camera.cameraMatrix)

    let normalMatrix = glMatrix.mat4.create()
    let normalMatrixLocation = gl.getUniformLocation(gpu, 'uNormalMatrix')

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, om.vertexIndexBuffer)
    gl.drawElements(gl.LINES, om.indices1.length, gl.UNSIGNED_SHORT, 0);
    


    gl.bindBuffer(gl.ARRAY_BUFFER, om.vertexBufferObject2)
    gl.vertexAttribPointer(om.vertexPositionAttribLocation2, 3, gl.FLOAT, gl.FALSE, 0, 0)
    gl.enableVertexAttribArray(om.vertexPositionAttribLocation2)

    gl.bindBuffer(gl.ARRAY_BUFFER, om.normalBufferObject2)
    gl.vertexAttribPointer(om.normalPositionAttribLocation2, 3, gl.FLOAT, gl.FALSE, 0, 0)
    gl.enableVertexAttribArray(om.normalPositionAttribLocation2)

    let projMatrix2 = glMatrix.mat4.create()
    let projMatrixLocation2 = gl.getUniformLocation(gpu, 'projMatrix')

    glMatrix.mat4.perspective(projMatrix2, Math.PI/180*60, 800/600, 0.1, 100.0)
    gl.uniformMatrix4fv(projMatrixLocation2, false, projMatrix2)

    let modelMatrix2 = glMatrix.mat4.create()
    let modelMatrixLocation2 = gl.getUniformLocation(gpu, 'modelToWorldMatrix')

    glMatrix.mat4.multiply(modelMatrix2, modelMatrix2, modelMatrix);
    glMatrix.mat4.translate(modelMatrix2, modelMatrix2, [-2.0, 0.0, -2.0])
    glMatrix.mat4.scale(modelMatrix2, modelMatrix2, [1.0, 1.0, 1.0])

    gl.uniformMatrix4fv(modelMatrixLocation2, false, modelMatrix2)

    let viewMatrix2 = glMatrix.mat4.create()
    glMatrix.mat4.lookAt(viewMatrix2, [-2.0, 0.0, -2.0], [1.0, 0.0, 0.0], [0.0, 1.0, 0.0])

    let viewMatrixLocation2 = gl.getUniformLocation(gpu, 'viewMatrix')
    gl.uniformMatrix4fv(viewMatrixLocation2, false, camera.cameraMatrix)

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, om.vertexIndexBuffer2)
    gl.drawElements(gl.LINES, om.indices2.length, gl.UNSIGNED_SHORT, 0);



    gl.bindBuffer(gl.ARRAY_BUFFER, om.vertexBufferObject3)
    gl.vertexAttribPointer(om.vertexPositionAttribLocation3, 3, gl.FLOAT, gl.FALSE, 0, 0)
    gl.enableVertexAttribArray(om.vertexPositionAttribLocation3)

    gl.bindBuffer(gl.ARRAY_BUFFER, om.normalBufferObject3)
    gl.vertexAttribPointer(om.normalPositionAttribLocation3, 3, gl.FLOAT, gl.FALSE, 0, 0)
    gl.enableVertexAttribArray(om.normalPositionAttribLocation3)

    let ucolorLocation2 = gl.getUniformLocation(gpu, 'uColor')
    gl.uniform3fv(ucolorLocation2, [1.0, 0.0, 0.0])

    let projMatrix3 = glMatrix.mat4.create()
    let projMatrixLocation3 = gl.getUniformLocation(gpu, 'projMatrix')

    glMatrix.mat4.perspective(projMatrix3, Math.PI/180*60, 800/600, 0.1, 100.0)
    gl.uniformMatrix4fv(projMatrixLocation3, false, projMatrix3)

    let modelMatrix3 = glMatrix.mat4.create()
    let modelMatrixLocation3 = gl.getUniformLocation(gpu, 'modelToWorldMatrix')

    glMatrix.mat4.translate(modelMatrix3, modelMatrix3, [2.0, 0.0, -2.0])
    glMatrix.mat4.rotate(modelMatrixLocation3, modelMatrix3, 0.0*Math.PI/180, [0.0, 1.0, 0.0])
    glMatrix.mat4.rotate(modelMatrix3, modelMatrix3, now, [0.0, -2.0, 0.0])
    glMatrix.mat4.scale(modelMatrix3, modelMatrix3, [1.0, 1.0, 1.0])

    gl.uniformMatrix4fv(modelMatrixLocation3, false, modelMatrix3)

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, om.vertexIndexBuffer3)
    gl.drawElements(gl.TRIANGLES, om.indices3.length, gl.UNSIGNED_SHORT, 0);



    let modelMatrix5 = glMatrix.mat4.create()
    let modelMatrixLocation5 = gl.getUniformLocation(gpu, 'modelToWorldMatrix')

    glMatrix.mat4.translate(modelMatrix5, modelMatrix5, [-3.0, -1.0, -2.0])
    glMatrix.mat4.rotate(modelMatrixLocation5, modelMatrix5, 0.0*Math.PI/180, [0.0, 1.0, 0.0])
    glMatrix.mat4.rotate(modelMatrix5, modelMatrix5, now*2, [1.0, -2.0, 1.0])
    glMatrix.mat4.scale(modelMatrix5, modelMatrix5, [1.0, 1.0, 1.0])

    let ucolorLocation5 = gl.getUniformLocation(gpu, 'uColor')
    gl.uniform3fv(ucolorLocation5, [1.0, 0.2, 0.9])

    gl.uniformMatrix4fv(modelMatrixLocation5, false, modelMatrix5)

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, om.vertexIndexBuffer3)
    gl.drawElements(gl.TRIANGLES, om.indices3.length, gl.UNSIGNED_SHORT, 0);



    gl.bindBuffer(gl.ARRAY_BUFFER, om.vertexBufferObject4)
    gl.vertexAttribPointer(om.vertexPositionAttribLocation4, 3, gl.FLOAT, gl.FALSE, 0, 0)
    gl.enableVertexAttribArray(om.vertexPositionAttribLocation4)

    gl.bindBuffer(gl.ARRAY_BUFFER, om.normalBufferObject4)
    gl.vertexAttribPointer(om.normalPositionAttribLocation4, 3, gl.FLOAT, gl.FALSE, 0, 0)
    gl.enableVertexAttribArray(om.normalPositionAttribLocation4)

    let ucolorLocation4 = gl.getUniformLocation(gpu, 'uColor')
    gl.uniform3fv(ucolorLocation4, [1.0, .3, 0.0])

    let projMatrix4 = glMatrix.mat4.create()
    let projMatrixLocation4 = gl.getUniformLocation(gpu, 'projMatrix')

    glMatrix.mat4.perspective(projMatrix4, Math.PI/180*60, 800/600, 0.1, 100.0)
    gl.uniformMatrix4fv(projMatrixLocation4, false, projMatrix4)

    let modelMatrix4 = glMatrix.mat4.create()
    let modelMatrixLocation4 = gl.getUniformLocation(gpu, 'modelToWorldMatrix')

    glMatrix.mat4.translate(modelMatrix4, modelMatrix4, [-3.0, 2.0, 0.0])
    glMatrix.mat4.rotate(modelMatrixLocation4, modelMatrix4, 0.0*Math.PI/180, [0.0, 1.0, 0.0])
    glMatrix.mat4.rotate(modelMatrix4, modelMatrix4, now*2, [-3.0, 1.0, 0.0])
    glMatrix.mat4.scale(modelMatrix4, modelMatrix4, [1.0, 1.0, 1.0])

    gl.uniformMatrix4fv(modelMatrixLocation4, false, modelMatrix4)

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, om.vertexIndexBuffer4)
    gl.drawElements(gl.TRIANGLES, om.indices4.length, gl.UNSIGNED_SHORT, 0);



    gl.bindBuffer(gl.ARRAY_BUFFER, om.vertexBufferObject6)
    gl.vertexAttribPointer(om.vertexPositionAttribLocation6, 3, gl.FLOAT, gl.FALSE, 0, 0)
    gl.enableVertexAttribArray(om.vertexPositionAttribLocation6)

    gl.bindBuffer(gl.ARRAY_BUFFER, om.normalBufferObject6)
    gl.vertexAttribPointer(om.normalPositionAttribLocation6, 3, gl.FLOAT, gl.FALSE, 0, 0)
    gl.enableVertexAttribArray(om.normalPositionAttribLocation6)

    let ucolorLocation6 = gl.getUniformLocation(gpu, 'uColor')
    gl.uniform3fv(ucolorLocation6, [0.0, 0.2, 0.8])

    let projMatrix6 = glMatrix.mat4.create()
    let projMatrixLocation6 = gl.getUniformLocation(gpu, 'projMatrix')

    glMatrix.mat4.perspective(projMatrix6, Math.PI/180*60, 800/600, 0.1, 100.0)
    gl.uniformMatrix4fv(projMatrixLocation6, false, projMatrix6)

    let modelMatrix6 = glMatrix.mat4.create()
    let modelMatrixLocation6 = gl.getUniformLocation(gpu, 'modelToWorldMatrix')

    glMatrix.mat4.translate(modelMatrix6, modelMatrix6, [0, 8, 0.0])
    glMatrix.mat4.scale(modelMatrix6, modelMatrix6, [10.0, 10.0, 10.0])

    gl.uniformMatrix4fv(modelMatrixLocation6, false, modelMatrix6)

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, om.vertexIndexBuffer6)
    gl.drawElements(gl.TRIANGLES, om.indices6.length, gl.UNSIGNED_SHORT, 0);

    requestAnimationFrame(drawLoop);
  }
}
  
/*@function initShaderProgram initializes shader program
* @param gl canvas
* @param vsSource vertex shader
* @param fsSource fragment shader
* @return shaderProgram
*/
function initShaderProgram(gl, vsSource, fsSource) {
  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
    return null;
  }

  return shaderProgram;
}

/*@function loadShader compiles shader programs
* @param gl canvas
* @param type shader program type (vertex or fragment)
* @param source shader program
* @return shader
*/
function loadShader(gl, type, source) {
  const shader = gl.createShader(type);

  gl.shaderSource(shader, source);

  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

/*@function initBuffers initializes buffer object, creates 3D shapes
* @param gl canvas
* @param gpu shader program
* @return bufferObject
*/
function initBuffers(gl, gpu){
  const vertexBufferObj = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObj);
  
  let t1 = uvTorus(1, 3, 32, 16);
  let positions = t1.vertexPositions;
  let vertexPAttrib = gl.getAttribLocation(gpu, 'vertPosition');

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  const normalBufferObj = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBufferObj);
  
  const normals = t1.vertexNormals;
  let normalPAttrib = gl.getAttribLocation(gpu, 'vertNormal');

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
  
  const indexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

  var indice = t1.indices;
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indice), gl.STATIC_DRAW);


  const vertexBufferObj2 = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObj2);
  
  let s1 = uvSphere(.5, 32, 16);
  let positions2 = s1.vertexPositions;
  let vertexPAttrib2 = gl.getAttribLocation(gpu, 'vertPosition');

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions2), gl.STATIC_DRAW);

  const normalBufferObj2 = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBufferObj2);
  
  const normals2 = s1.vertexNormals;
  let normalPAttrib2 = gl.getAttribLocation(gpu, 'vertNormal');

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals2), gl.STATIC_DRAW);
  
  const indexBuffer2 = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer2);

  var indice2 = s1.indices;
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indice2), gl.STATIC_DRAW);
  

  const vertexBufferObj3 = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObj3);
  
  let c1 = cube(.4);
  let positions3 = c1.vertexPositions;
  let vertexPAttrib3 = gl.getAttribLocation(gpu, 'vertPosition');

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions3), gl.STATIC_DRAW);

  const normalBufferObj3 = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBufferObj3);
  
  const normals3 = c1.vertexNormals;
  let normalPAttrib3 = gl.getAttribLocation(gpu, 'vertNormal');

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals3), gl.STATIC_DRAW);
  
  const indexBuffer3 = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer3);

  var indice3 = c1.indices;
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indice3), gl.STATIC_DRAW);
  

  const vertexBufferObj4 = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObj4);
  
  let co1 = uvCone(.3, 1, 32, false);
  let positions4 = co1.vertexPositions;
  let vertexPAttrib4 = gl.getAttribLocation(gpu, 'vertPosition');

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions4), gl.STATIC_DRAW);

  const normalBufferObj4 = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBufferObj4);
  
  const normals4 = co1.vertexNormals;
  let normalPAttrib4 = gl.getAttribLocation(gpu, 'vertNormal');

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals4), gl.STATIC_DRAW);
  
  const indexBuffer4 = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer4);

  var indice4 = co1.indices;
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indice4), gl.STATIC_DRAW);
  

  const vertexBufferObj6 = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBufferObj6);
  
  let f = floor();
  let positions6 = f.vertexPositions;
  let vertexPAttrib6 = gl.getAttribLocation(gpu, 'vertPosition');

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions6), gl.STATIC_DRAW);

  const normalBufferObj6 = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, normalBufferObj6);
  
  const normals6 = f.vertexNormals;
  let normalPAttrib6 = gl.getAttribLocation(gpu, 'vertNormal');

  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals6), gl.STATIC_DRAW);
  
  const indexBuffer6 = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer6);

  var indice6 = f.indices;
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indice6), gl.STATIC_DRAW);
  
  return {
    indices1: indice, 
    vertexBufferObject: vertexBufferObj,
    normalBufferObject: normalBufferObj,
    vertexIndexBuffer: indexBuffer,
    vertexPositionAttribLocation: vertexPAttrib,
    normalPositionAttribLocation: normalPAttrib,
    
    indices2: indice2,
    vertexBufferObject2: vertexBufferObj2,
    normalBufferObject2: normalBufferObj2,
    vertexIndexBuffer2: indexBuffer2,
    vertexPositionAttribLocation2: vertexPAttrib2,
    normalPositionAttribLocation2: normalPAttrib2,
    
    indices3: indice3,
    vertexBufferObject3: vertexBufferObj3,
    normalBufferObject3: normalBufferObj3,
    vertexIndexBuffer3: indexBuffer3,
    vertexPositionAttribLocation3: vertexPAttrib3,
    normalPositionAttribLocation3: normalPAttrib3,
    
    indices4: indice4,
    vertexBufferObject4: vertexBufferObj4,
    normalBufferObject4: normalBufferObj4,
    vertexIndexBuffer4: indexBuffer4,
    vertexPositionAttribLocation4: vertexPAttrib4,
    normalPositionAttribLocation4: normalPAttrib4,
    
    indices6: indice6,
    vertexBufferObject6: vertexBufferObj6,
    normalBufferObject6: normalBufferObj6,
    vertexIndexBuffer6: indexBuffer6,
    vertexPositionAttribLocation6: vertexPAttrib6,
    normalPositionAttribLocation6: normalPAttrib6,
  };
}

/*@function floor creates 3D floor object
* @return floor object 
*/
function floor(){
   var s = 1;
   var coords = [];
   var normals = [];
   var texCoords = [];
   var indices = [];
   function face(xyz, nrm) {
      var start = coords.length/3;
      var i;
      for (i = 0; i < 12; i++) {
         coords.push(xyz[i]);
      }
      for (i = 0; i < 4; i++) {
         normals.push(nrm[0],nrm[1],nrm[2]);
      }
      texCoords.push(0,0,1,0,1,1,0,1);
      indices.push(start,start+1,start+2,start,start+2,start+3);
   }
   face( [-s,-s,-s, s,-s,-s, s,-s,s, -s,-s,s], [0,-1,0] );
   console.log(indices);
   return {
       vertexPositions: new Float32Array(coords),
      vertexNormals: new Float32Array(normals),
      vertexTextureCoords: new Float32Array(texCoords),
      indices: new Uint16Array(indices)
   };
}

/**
 * Create a model of a torus (surface of a doughnut).  The z-axis goes through the doughnut hole,
 * and the center of the torus is at (0,0,0).
 * @param outerRadius the distance from the center to the outside of the tube, 0.5 if not specified.
 * @param innerRadius the distance from the center to the inside of the tube, outerRadius/3 if not
 *    specified.  (This is the radius of the doughnut hole.)
 * @param slices the number of lines of longitude, default 32.  These are slices parallel to the
 * z-axis and go around the tube the short way (through the hole).
 * @param stacks the number of lines of latitude plus 1, default 16.  These lines are perpendicular
 * to the z-axis and go around the tube the long way (arouind the hole).
 */
function uvTorus(outerRadius, innerRadius, slices, stacks) {
   outerRadius = outerRadius || 0.5;
   innerRadius = innerRadius || outerRadius/3;
   slices = slices || 32;
   stacks = stacks || 16;
   var vertexCount = (slices+1)*(stacks+1);
   var vertices = new Float32Array( 3*vertexCount );
   var normals = new Float32Array( 3* vertexCount );
   var texCoords = new Float32Array( 2*vertexCount );
   var indices = new Uint16Array( 2*slices*stacks*3 );
   var du = 2*Math.PI/slices;
   var dv = 2*Math.PI/stacks;
   var centerRadius = (innerRadius+outerRadius)/2;
   var tubeRadius = outerRadius - centerRadius;
   var i,j,u,v,cx,cy,sin,cos,x,y,z;
   var indexV = 0;
   var indexT = 0;
   for (j = 0; j <= stacks; j++) {
      v = -Math.PI + j*dv;
      cos = Math.cos(v);
      sin = Math.sin(v);
      for (i = 0; i <= slices; i++) {
         u = i*du;
         cx = Math.cos(u);
         cy = Math.sin(u);
         x = cx*(centerRadius + tubeRadius*cos);
         y = cy*(centerRadius + tubeRadius*cos);
         z = sin*tubeRadius;
         vertices[indexV] = x;
         normals[indexV++] = cx*cos;
         vertices[indexV] = y
         normals[indexV++] = cy*cos;
         vertices[indexV] = z
         normals[indexV++] = sin;
         texCoords[indexT++] = i/slices;
         texCoords[indexT++] = j/stacks;
      } 
   }
   var k = 0;
   for (j = 0; j < stacks; j++) {
      var row1 = j*(slices+1);
      var row2 = (j+1)*(slices+1);
      for (i = 0; i < slices; i++) {
          indices[k++] = row1 + i;
          indices[k++] = row2 + i + 1;
          indices[k++] = row2 + i;
          indices[k++] = row1 + i;
          indices[k++] = row1 + i + 1;
          indices[k++] = row2 + i + 1;
      }
   }
   return {
       vertexPositions: vertices,
       vertexNormals: normals,
       vertexTextureCoords: texCoords,
       indices: indices
   };
}

/**
 * Create a model of a sphere.  The z-axis is the axis of the sphere,
 * with the north pole on the positive z-axis and the center at (0,0,0).
 * @param radius the radius of the sphere, default 0.5 if not specified.
 * @param slices the number of lines of longitude, default 32
 * @param stacks the number of lines of latitude plus 1, default 16.  (This 
 *    is the number of vertical slices, bounded by lines of latitude, the
 *    north pole and the south pole.)
 */
function uvSphere(radius, slices, stacks) {
   radius = radius || 0.5;
   slices = slices || 32;
   stacks = stacks || 16;
   var vertexCount = (slices+1)*(stacks+1);
   var vertices = new Float32Array( 3*vertexCount );
   var normals = new Float32Array( 3* vertexCount );
   var texCoords = new Float32Array( 2*vertexCount );
   var indices = new Uint16Array( 2*slices*stacks*3 );
   var du = 2*Math.PI/slices;
   var dv = Math.PI/stacks;
   var i,j,u,v,x,y,z;
   var indexV = 0;
   var indexT = 0;
   for (i = 0; i <= stacks; i++) {
      v = -Math.PI/2 + i*dv;
      for (j = 0; j <= slices; j++) {
         u = j*du;
         x = Math.cos(u)*Math.cos(v);
         y = Math.sin(u)*Math.cos(v);
         z = Math.sin(v);
         vertices[indexV] = radius*x;
         normals[indexV++] = x;
         vertices[indexV] = radius*y;
         normals[indexV++] = y;
         vertices[indexV] = radius*z;
         normals[indexV++] = z;
         texCoords[indexT++] = j/slices;
         texCoords[indexT++] = i/stacks;
      } 
   }
   var k = 0;
   for (j = 0; j < stacks; j++) {
      var row1 = j*(slices+1);
      var row2 = (j+1)*(slices+1);
      for (i = 0; i < slices; i++) {
          indices[k++] = row1 + i;
          indices[k++] = row2 + i + 1;
          indices[k++] = row2 + i;
          indices[k++] = row1 + i;
          indices[k++] = row1 + i + 1;
          indices[k++] = row2 + i + 1;
      }
   }
   return {
       vertexPositions: vertices,
       vertexNormals: normals,
       vertexTextureCoords: texCoords,
       indices: indices
   };
}

 /**
  * Create a model of a cube, centered at the origin.  (This is not
  * a particularly good format for a cube, since an IFS representation
  * has a lot of redundancy.)
  * @side the length of a side of the cube.  If not given, the value will be 1.
  */
function cube(side) {
   var s = (side || 1)/2;
   var coords = [];
   var normals = [];
   var texCoords = [];
   var indices = [];
   function face(xyz, nrm) {
      var start = coords.length/3;
      console.log(start);
      var i;
      for (i = 0; i < 12; i++) {
         coords.push(xyz[i]);
      }
      for (i = 0; i < 4; i++) {
         normals.push(nrm[0],nrm[1],nrm[2]);
      }
      texCoords.push(0,0,1,0,1,1,0,1);
      indices.push(start,start+1,start+2,start,start+2,start+3);
   }
   face( [-s,-s,s, s,-s,s, s,s,s, -s,s,s], [0,0,1] );
   face( [-s,-s,-s, -s,s,-s, s,s,-s, s,-s,-s], [0,0,-1] );
   face( [-s,s,-s, -s,s,s, s,s,s, s,s,-s], [0,1,0] );
   face( [-s,-s,-s, s,-s,-s, s,-s,s, -s,-s,s], [0,-1,0] );
   face( [s,-s,-s, s,s,-s, s,s,s, s,-s,s], [1,0,0] );
   face( [-s,-s,-s, -s,-s,s, -s,s,s, -s,s,-s], [-1,0,0] );
   console.log(indices);
   return {
      vertexPositions: new Float32Array(coords),
      vertexNormals: new Float32Array(normals),
      vertexTextureCoords: new Float32Array(texCoords),
      indices: new Uint16Array(indices)
   }
}

/**
 * Defines a model of a cone.  The axis of the cone is the z-axis,
 * and the center is at (0,0,0).
 * @param radius the radius of the cone
 * @param height the height of the cone.  The cone extends from -height/2
 * to height/2 along the z-axis, with the tip at (0,0,height/2).
 * @param slices the number of slices, like the slices of an orange.
 * @param noBottom if missing or false, the cone has a bottom; if set to true,
 *   the cone has a bottom. The bottom is a disk at the wide end of the cone.
 */
function uvCone(radius, height, slices, noBottom) {
   radius = radius || 0.5;
   height = height || 2*radius;
   slices = slices || 32;
   var fractions = [ 0, 0.5, 0.75, 0.875, 0.9375 ];
   var vertexCount = fractions.length*(slices+1) + slices;
   if (!noBottom)
      vertexCount += slices + 2;
   var triangleCount = (fractions.length-1)*slices*2 + slices;
   if (!noBottom)
      triangleCount += slices;
   var vertices = new Float32Array(vertexCount*3);
   var normals = new Float32Array(vertexCount*3);
   var texCoords = new Float32Array(vertexCount*2);
   var indices = new Uint16Array(triangleCount*3);
   var normallength = Math.sqrt(height*height+radius*radius);
   var n1 = height/normallength;
   var n2 = radius/normallength; 
   var du = 2*Math.PI / slices;
   var kv = 0;
   var kt = 0;
   var k = 0;
   var i,j,u;
   for (j = 0; j < fractions.length; j++) {
      var uoffset = (j % 2 == 0? 0 : 0.5);
      for (i = 0; i <= slices; i++) {
         var h1 = -height/2 + fractions[j]*height;
         u = (i+uoffset)*du;
         var c = Math.cos(u);
         var s = Math.sin(u);
         vertices[kv] = c*radius*(1-fractions[j]);
         normals[kv++] = c*n1;
         vertices[kv] = s*radius*(1-fractions[j]);
         normals[kv++] = s*n1;
         vertices[kv] = h1;
         normals[kv++] = n2;
         texCoords[kt++] = (i+uoffset)/slices;
         texCoords[kt++] = fractions[j];
      }
   }
   var k = 0;
   for (j = 0; j < fractions.length-1; j++) {
      var row1 = j*(slices+1);
      var row2 = (j+1)*(slices+1);
      for (i = 0; i < slices; i++) {
          indices[k++] = row1 + i;
          indices[k++] = row2 + i + 1;
          indices[k++] = row2 + i;
          indices[k++] = row1 + i;
          indices[k++] = row1 + i + 1;
          indices[k++] = row2 + i + 1;
      }
   }
   var start = kv/3 - (slices+1);
   for (i = 0; i < slices; i++) { // slices points at top, with different normals, texcoords
      u = (i+0.5)*du;
      var c = Math.cos(u);
      var s = Math.sin(u);
      vertices[kv] = 0;
      normals[kv++] = c*n1;
      vertices[kv] = 0;
      normals[kv++] = s*n1;
      vertices[kv] = height/2;
      normals[kv++] = n2;
      texCoords[kt++] = (i+0.5)/slices;
      texCoords[kt++] = 1;
   }
   for (i = 0; i < slices; i++) {
      indices[k++] = start+i;
      indices[k++] = start+i+1;
      indices[k++] = start+(slices+1)+i;
   }
   if (!noBottom) {
      var startIndex = kv/3;
      vertices[kv] = 0;
      normals[kv++] = 0;
      vertices[kv] = 0;
      normals[kv++] = 0;
      vertices[kv] = -height/2;
      normals[kv++] = -1;
      texCoords[kt++] = 0.5;
      texCoords[kt++] = 0.5; 
      for (i = 0; i <= slices; i++) {
         u = 2*Math.PI - i*du;
         var c = Math.cos(u);
         var s = Math.sin(u);
         vertices[kv] = c*radius;
         normals[kv++] = 0;
         vertices[kv] = s*radius;
         normals[kv++] = 0;
         vertices[kv] = -height/2;
         normals[kv++] = -1;
         texCoords[kt++] = 0.5 - 0.5*c;
         texCoords[kt++] = 0.5 + 0.5*s;
      }
      for (i = 0; i < slices; i++) {
         indices[k++] = startIndex;
         indices[k++] = startIndex + i + 1;
         indices[k++] = startIndex + i + 2;
      }
   } 
   return {
       vertexPositions: vertices,
       vertexNormals: normals,
       vertexTextureCoords: texCoords,
       indices: indices
   };   
}