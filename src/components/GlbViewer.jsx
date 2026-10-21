import { useEffect, useRef } from 'react'
import { col } from '../utils'
import modelUrl from '../assets/prize-wheel.glb?url'

const IDENTITY = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]

function multiply(a, b) {
  const out = new Float32Array(16)
  for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) {
    out[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3]
  }
  return out
}

function nodeMatrix(node, spin = 0) {
  if (node.matrix) return new Float32Array(node.matrix)
  const [x, y, z, w] = node.name === 'WheelSpinPivot'
    ? [0, 0, Math.sin(spin / 2), Math.cos(spin / 2)]
    : node.rotation || [0, 0, 0, 1]
  const [sx, sy, sz] = node.scale || [1, 1, 1]
  const [tx, ty, tz] = node.translation || [0, 0, 0]
  return new Float32Array([
    (1 - 2 * (y * y + z * z)) * sx, (2 * (x * y + z * w)) * sx, (2 * (x * z - y * w)) * sx, 0,
    (2 * (x * y - z * w)) * sy, (1 - 2 * (x * x + z * z)) * sy, (2 * (y * z + x * w)) * sy, 0,
    (2 * (x * z + y * w)) * sz, (2 * (y * z - x * w)) * sz, (1 - 2 * (x * x + y * y)) * sz, 0,
    tx, ty, tz, 1,
  ])
}

function perspective(fov, aspect, near, far) {
  const f = 1 / Math.tan(fov / 2)
  return new Float32Array([f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) / (near - far), -1, 0, 0, (2 * far * near) / (near - far), 0])
}

function lookAt(eye, target) {
  const norm = (v) => { const n = Math.hypot(...v) || 1; return v.map((x) => x / n) }
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
  const z = norm(eye.map((v, i) => v - target[i]))
  const x = norm(cross([0, 1, 0], z))
  const y = cross(z, x)
  return new Float32Array([x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -dot(x, eye), -dot(y, eye), -dot(z, eye), 1])
}

function createShader(gl, type, source) {
  const shader = gl.createShader(type)
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader))
  return shader
}

function accessorData(gltf, bin, index, indices = false) {
  const accessor = gltf.accessors[index]
  if (!accessor || accessor.bufferView === undefined) throw new Error(`GLB accessor ${index} is missing its buffer view`)
  const view = gltf.bufferViews[accessor.bufferView]
  if (!view) throw new Error(`GLB buffer view ${accessor.bufferView} is missing`)
  const base = view.byteOffset || 0
  const offset = base + (accessor.byteOffset || 0)
  if (indices) {
    const bytes = accessor.componentType === 5125 ? 4 : accessor.componentType === 5123 ? 2 : accessor.componentType === 5121 ? 1 : 0
    if (!bytes) throw new Error(`Unsupported GLB index type ${accessor.componentType}`)
    const stride = view.byteStride || bytes
    const out = bytes === 4 ? new Uint32Array(accessor.count) : bytes === 2 ? new Uint16Array(accessor.count) : new Uint8Array(accessor.count)
    const data = new DataView(bin)
    for (let i = 0; i < accessor.count; i++) out[i] = bytes === 4 ? data.getUint32(offset + i * stride, true) : bytes === 2 ? data.getUint16(offset + i * stride, true) : data.getUint8(offset + i * stride)
    return out
  }
  const size = accessor.type === 'VEC3' ? 3 : accessor.type === 'VEC2' ? 2 : 1
  if (accessor.componentType !== 5126) throw new Error(`Unsupported GLB vertex type ${accessor.componentType}`)
  const stride = view.byteStride || size * 4
  const out = new Float32Array(accessor.count * size)
  const data = new DataView(bin)
  for (let i = 0; i < accessor.count; i++) for (let j = 0; j < size; j++) out[i * size + j] = data.getFloat32(offset + i * stride + j * 4, true)
  return out
}

function hexColor(value) {
  const match = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(value || '')
  if (!match) return [0.85, 0.3, 0.2, 1]
  return [1, 2, 3].map((i) => (parseInt(match[i], 16) / 255) ** 2.2).concat(1)
}

function buildDynamicWheel(gl, items, pal) {
  const segments = []
  const push = (out, p, n) => out.push(...p, ...n)
  const tri = (out, a, b, c, normal) => { push(out, a, normal); push(out, b, normal); push(out, c, normal) }
  const count = Math.max(2, items.length)
  const step = (Math.PI * 2) / count
  const makePoint = (angle, radius, z) => [Math.sin(angle) * radius, Math.cos(angle) * radius, z]
  for (let i = 0; i < count; i++) {
    const vertices = []
    const start = -Math.PI / count + i * step
    const steps = Math.max(8, Math.ceil(48 / count))
    for (let j = 0; j < steps; j++) {
      const a = start + (j / steps) * step; const b = start + ((j + 1) / steps) * step
      const ia = makePoint(a, .18, .405); const ib = makePoint(b, .18, .405)
      const oa = makePoint(a, 1.49, .405); const ob = makePoint(b, 1.49, .405)
      const iab = makePoint(a, .18, .19); const ibb = makePoint(b, .18, .19)
      const oab = makePoint(a, 1.49, .19); const obb = makePoint(b, 1.49, .19)
      tri(vertices, ia, ib, ob, [0, 0, 1]); tri(vertices, ia, ob, oa, [0, 0, 1])
      tri(vertices, iab, oab, obb, [0, 0, -1]); tri(vertices, iab, obb, ibb, [0, 0, -1])
      const mid = (a + b) / 2; const radial = [Math.sin(mid), Math.cos(mid), 0]
      tri(vertices, oa, ob, obb, radial); tri(vertices, oa, obb, oab, radial)
      tri(vertices, ib, ia, iab, [-radial[0], -radial[1], 0]); tri(vertices, ib, iab, ibb, [-radial[0], -radial[1], 0])
    }
    const startA = start; const endA = start + step
    const edgeNormal = (angle, sign) => [Math.cos(angle) * sign, -Math.sin(angle) * sign, 0]
    for (const [angle, normal, reverse] of [[startA, edgeNormal(startA, -1), false], [endA, edgeNormal(endA, 1), true]]) {
      const inn = makePoint(angle, .18, .405); const out = makePoint(angle, 1.49, .405)
      const innB = makePoint(angle, .18, .19); const outB = makePoint(angle, 1.49, .19)
      if (!reverse) { tri(vertices, inn, out, outB, normal); tri(vertices, inn, outB, innB, normal) }
      else { tri(vertices, inn, outB, out, normal); tri(vertices, inn, innB, outB, normal) }
    }
    const buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)
    const color = items[i] ? col(items[i], i, pal) : ['#ef4444', '#3b82f6'][i % 2]
    segments.push({ buffer, count: vertices.length / 6, color: hexColor(color) })
  }

  const labelCanvas = document.createElement('canvas'); labelCanvas.width = 1024; labelCanvas.height = 1024
  const ctx = labelCanvas.getContext('2d'); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  const fontSize = Math.max(20, Math.min(38, 430 / Math.max(count, 6)))
  ctx.font = `700 ${fontSize}px Arial, sans-serif`; ctx.lineJoin = 'round'
  items.forEach((item, i) => {
    const angle = i * step; const radius = 320
    const x = 512 + Math.sin(angle) * radius; const y = 512 - Math.cos(angle) * radius
    let label = String(item.t || '')
    while (ctx.measureText(label).width > 250 && label.length > 4) label = `${label.slice(0, -2)}…`
    ctx.lineWidth = 7; ctx.strokeStyle = 'rgba(18,20,31,.82)'; ctx.strokeText(label, x, y)
    ctx.fillStyle = '#fff4dd'; ctx.fillText(label, x, y)
  })
  const texture = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, labelCanvas)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  const quad = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, quad)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1.4,-1.4,.408,0,0, 1.4,-1.4,.408,1,0, 1.4,1.4,.408,1,1,
    -1.4,-1.4,.408,0,0, 1.4,1.4,.408,1,1, -1.4,1.4,.408,0,1,
  ]), gl.STATIC_DRAW)
  return { segments, texture, quad }
}

function buildPointer(gl) {
  const trianglePrism = (points, zFront, zBack) => {
    const out = []
    const add = (p, n) => out.push(...p, ...n)
    const tri = (a, b, c, n) => { add(a, n); add(b, n); add(c, n) }
    const [left, tip, right] = points
    tri([left[0], left[1], zFront], [tip[0], tip[1], zFront], [right[0], right[1], zFront], [0, 0, 1])
    tri([right[0], right[1], zBack], [tip[0], tip[1], zBack], [left[0], left[1], zBack], [0, 0, -1])
    const edges = [[left, tip], [tip, right], [right, left]]
    for (const [a, b] of edges) {
      const dx = b[0] - a[0]; const dy = b[1] - a[1]
      const normal = [dy, -dx, 0]; const length = Math.hypot(normal[0], normal[1]) || 1
      normal[0] /= length; normal[1] /= length
      const af = [a[0], a[1], zFront]; const bf = [b[0], b[1], zFront]
      const ab = [a[0], a[1], zBack]; const bb = [b[0], b[1], zBack]
      tri(af, ab, bb, normal); tri(af, bb, bf, normal)
    }
    const buffer = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(out), gl.STATIC_DRAW)
    return { buffer, count: out.length / 6 }
  }
  return {
    gold: trianglePrism([[-.39, 5.45], [0, 4.48], [.39, 5.45]], .56, .40),
    red: trianglePrism([[-.25, 5.34], [0, 4.70], [.25, 5.34]], .595, .575),
  }
}

function initRenderer(canvas, initialItems, initialPal, onReady) {
  const gl = canvas.getContext('webgl2', { alpha: true, antialias: true }) || canvas.getContext('webgl', { alpha: true, antialias: true })
  if (!gl) throw new Error('เบราว์เซอร์นี้ไม่รองรับ WebGL')
  const webgl2 = typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext
  const vertexSource = webgl2 ? `#version 300 es
    in vec3 aPosition; in vec3 aNormal; in vec2 aUV; uniform mat4 uPV; uniform mat4 uModel;
    out vec3 vNormal; out vec3 vPosition; out vec2 vUV;
    void main(){ vec4 world=uModel*vec4(aPosition,1.0); vPosition=world.xyz; vNormal=normalize(mat3(uModel)*aNormal); vUV=aUV; gl_Position=uPV*world; }
  ` : `attribute vec3 aPosition; attribute vec3 aNormal; attribute vec2 aUV; uniform mat4 uPV; uniform mat4 uModel;
    varying vec3 vNormal; varying vec3 vPosition; varying vec2 vUV;
    void main(){ vec4 world=uModel*vec4(aPosition,1.0); vPosition=world.xyz; vNormal=normalize(mat3(uModel)*aNormal); vUV=aUV; gl_Position=uPV*world; }
  `
  const fragmentSource = webgl2 ? `#version 300 es
    precision highp float; in vec3 vNormal; in vec3 vPosition; in vec2 vUV;
    uniform vec4 uColor; uniform float uMetal; uniform float uRough; uniform int uLabelMode; uniform sampler2D uLabelTexture; out vec4 outColor;
    void main(){ if(uLabelMode==1){ vec4 label=texture(uLabelTexture,vUV); if(label.a<0.03) discard; outColor=label; return; }
      vec3 n=normalize(vNormal); vec3 l=normalize(vec3(-0.45,0.8,0.65)); vec3 v=normalize(vec3(0.0,2.5,8.5)-vPosition);
      float diffuse=max(dot(n,l),0.0); float spec=pow(max(dot(reflect(-l,n),v),0.0),mix(72.0,10.0,uRough));
      vec3 base=uColor.rgb*(0.40+0.80*diffuse)+vec3(1.0,0.78,0.48)*spec*(0.12+0.38*uMetal); outColor=vec4(pow(max(base,vec3(0.0)),vec3(1.0/2.2)),uColor.a); }
  ` : `precision highp float; varying vec3 vNormal; varying vec3 vPosition; varying vec2 vUV;
    uniform vec4 uColor; uniform float uMetal; uniform float uRough; uniform int uLabelMode; uniform sampler2D uLabelTexture;
    void main(){ if(uLabelMode==1){ vec4 label=texture2D(uLabelTexture,vUV); if(label.a<0.03) discard; gl_FragColor=label; return; }
      vec3 n=normalize(vNormal); vec3 l=normalize(vec3(-0.45,0.8,0.65)); vec3 v=normalize(vec3(0.0,2.5,8.5)-vPosition);
      float diffuse=max(dot(n,l),0.0); float spec=pow(max(dot(reflect(-l,n),v),0.0),mix(72.0,10.0,uRough));
      vec3 base=uColor.rgb*(0.40+0.80*diffuse)+vec3(1.0,0.78,0.48)*spec*(0.12+0.38*uMetal); gl_FragColor=vec4(pow(max(base,vec3(0.0)),vec3(1.0/2.2)),uColor.a); }
  `
  const vertex = createShader(gl, gl.VERTEX_SHADER, vertexSource)
  const fragment = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource)
  const program = gl.createProgram()
  gl.attachShader(program, vertex); gl.attachShader(program, fragment); gl.linkProgram(program)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program))
  gl.useProgram(program)
  const loc = {
    position: gl.getAttribLocation(program, 'aPosition'), normal: gl.getAttribLocation(program, 'aNormal'), uv: gl.getAttribLocation(program, 'aUV'),
    pv: gl.getUniformLocation(program, 'uPV'), model: gl.getUniformLocation(program, 'uModel'),
    color: gl.getUniformLocation(program, 'uColor'), metal: gl.getUniformLocation(program, 'uMetal'), rough: gl.getUniformLocation(program, 'uRough'),
    labelMode: gl.getUniformLocation(program, 'uLabelMode'), labelTexture: gl.getUniformLocation(program, 'uLabelTexture'),
  }
  gl.enable(gl.DEPTH_TEST); gl.enable(gl.CULL_FACE); gl.cullFace(gl.BACK)
  gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
  let sceneData = null
  const pointer = buildPointer(gl)
  let spinAngle = 0
  let frame = 0
  let stopped = false
  const loadController = new AbortController()

  function draw() {
    if (stopped) return
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    const width = Math.max(1, Math.floor(canvas.clientWidth * dpr)); const height = Math.max(1, Math.floor(canvas.clientHeight * dpr))
    if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height }
    gl.viewport(0, 0, width, height); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    if (sceneData) {
      const radius = 8.7
      const eye = [-0.14, 4.0, radius]
      const pv = multiply(perspective(38 * Math.PI / 180, width / height, .1, 100), lookAt(eye, [-0.14, 2.7, 0]))
      gl.uniformMatrix4fv(loc.pv, false, pv)
      const visit = (index, parent) => {
        const node = sceneData.gltf.nodes[index]
        const local = nodeMatrix(node, node.name === 'WheelSpinPivot' ? spinAngle : 0)
        const world = multiply(parent, local)
        if (node.mesh !== undefined && !/^(Prize sector|Sector icon|Sector label|Sector divider)/.test(node.name || '')) {
          for (const primitive of sceneData.gltf.meshes[node.mesh].primitives) {
            const gpu = sceneData.primitives.get(primitive)
            if (!gpu) continue
            gl.bindBuffer(gl.ARRAY_BUFFER, gpu.position)
            gl.enableVertexAttribArray(loc.position); gl.vertexAttribPointer(loc.position, 3, gl.FLOAT, false, 0, 0)
            gl.disableVertexAttribArray(loc.uv)
            gl.bindBuffer(gl.ARRAY_BUFFER, gpu.normal)
            gl.enableVertexAttribArray(loc.normal); gl.vertexAttribPointer(loc.normal, 3, gl.FLOAT, false, 0, 0)
            const mat = sceneData.gltf.materials?.[primitive.material]?.pbrMetallicRoughness || {}
            gl.uniform4fv(loc.color, mat.baseColorFactor || [0.8, 0.8, 0.8, 1])
            gl.uniform1f(loc.metal, mat.metallicFactor ?? 0.2); gl.uniform1f(loc.rough, mat.roughnessFactor ?? 0.45)
            gl.uniform1i(loc.labelMode, 0)
            gl.uniformMatrix4fv(loc.model, false, world)
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, gpu.indices)
            gl.drawElements(gl.TRIANGLES, gpu.count, gpu.type, 0)
          }
        }
        if (node.name === 'WheelSpinPivot' && sceneData.dynamicWheel) {
          for (const segment of sceneData.dynamicWheel.segments) {
            gl.bindBuffer(gl.ARRAY_BUFFER, segment.buffer)
            gl.enableVertexAttribArray(loc.position); gl.vertexAttribPointer(loc.position, 3, gl.FLOAT, false, 24, 0)
            gl.enableVertexAttribArray(loc.normal); gl.vertexAttribPointer(loc.normal, 3, gl.FLOAT, false, 24, 12)
            gl.disableVertexAttribArray(loc.uv); gl.uniform1i(loc.labelMode, 0)
            gl.uniform4fv(loc.color, segment.color); gl.uniform1f(loc.metal, 0.08); gl.uniform1f(loc.rough, 0.34)
            gl.uniformMatrix4fv(loc.model, false, world)
            gl.drawArrays(gl.TRIANGLES, 0, segment.count)
          }
          sceneData.pivotWorld = world
        }
        node.children?.forEach((child) => visit(child, world))
      }
      sceneData.gltf.scenes[sceneData.gltf.scene || 0].nodes.forEach((index) => visit(index, IDENTITY))
      if (sceneData.pivotWorld && sceneData.dynamicWheel) {
        const quad = sceneData.dynamicWheel.quad
        gl.bindBuffer(gl.ARRAY_BUFFER, quad)
        gl.enableVertexAttribArray(loc.position); gl.vertexAttribPointer(loc.position, 3, gl.FLOAT, false, 20, 0)
        gl.disableVertexAttribArray(loc.normal); gl.vertexAttrib3f(loc.normal, 0, 0, 1)
        gl.enableVertexAttribArray(loc.uv); gl.vertexAttribPointer(loc.uv, 2, gl.FLOAT, false, 20, 12)
        gl.uniformMatrix4fv(loc.model, false, sceneData.pivotWorld)
        gl.uniform1i(loc.labelMode, 1); gl.uniform1i(loc.labelTexture, 0)
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, sceneData.dynamicWheel.texture)
        gl.depthMask(false); gl.drawArrays(gl.TRIANGLES, 0, 6); gl.depthMask(true)
      }
      const drawPointerPart = (part, color, metal, rough) => {
        gl.bindBuffer(gl.ARRAY_BUFFER, part.buffer)
        gl.enableVertexAttribArray(loc.position); gl.vertexAttribPointer(loc.position, 3, gl.FLOAT, false, 24, 0)
        gl.enableVertexAttribArray(loc.normal); gl.vertexAttribPointer(loc.normal, 3, gl.FLOAT, false, 24, 12)
        gl.disableVertexAttribArray(loc.uv); gl.uniform1i(loc.labelMode, 0)
        gl.uniform4fv(loc.color, color); gl.uniform1f(loc.metal, metal); gl.uniform1f(loc.rough, rough)
        gl.uniformMatrix4fv(loc.model, false, IDENTITY)
        gl.drawArrays(gl.TRIANGLES, 0, part.count)
      }
      drawPointerPart(pointer.gold, [0.94, 0.58, 0.12, 1], 0.78, 0.2)
      drawPointerPart(pointer.red, [0.78, 0.035, 0.055, 1], 0.22, 0.24)
    }
    frame = requestAnimationFrame(draw)
  }

  async function load() {
    const response = await fetch(modelUrl, { signal: loadController.signal })
    if (!response.ok) throw new Error(`Model request failed (${response.status} ${response.statusText || ''})`)
    const bytes = await response.arrayBuffer()
    if (bytes.byteLength < 20) throw new Error('The GLB file is incomplete')
    const header = new DataView(bytes)
    if (header.getUint32(0, true) !== 0x46546c67 || header.getUint32(4, true) !== 2) throw new Error('The model file is not a valid GLB 2.0 file')
    const declaredLength = header.getUint32(8, true)
    if (declaredLength > bytes.byteLength) throw new Error('The GLB file was truncated while downloading')
    let offset = 12; let gltf = null; let bin = null
    while (offset + 8 <= declaredLength) {
      const chunkLength = header.getUint32(offset, true)
      const chunkType = header.getUint32(offset + 4, true)
      const chunkStart = offset + 8; const chunkEnd = chunkStart + chunkLength
      if (chunkEnd > declaredLength) throw new Error('The GLB file contains an invalid chunk length')
      if (chunkType === 0x4e4f534a) gltf = JSON.parse(new TextDecoder().decode(bytes.slice(chunkStart, chunkEnd)).trim())
      if (chunkType === 0x004e4942) bin = bytes.slice(chunkStart, chunkEnd)
      offset = chunkEnd
    }
    if (!gltf || !bin) throw new Error('The GLB file is missing its scene or mesh data')
    if (!gltf.scenes?.length || !gltf.nodes?.length || !gltf.meshes?.length) throw new Error('The GLB file has no renderable scene')
    const primitives = new Map()
    for (const mesh of gltf.meshes) for (const primitive of mesh.primitives) {
      const position = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, position); gl.bufferData(gl.ARRAY_BUFFER, accessorData(gltf, bin, primitive.attributes.POSITION), gl.STATIC_DRAW)
      const normal = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, normal); gl.bufferData(gl.ARRAY_BUFFER, accessorData(gltf, bin, primitive.attributes.NORMAL), gl.STATIC_DRAW)
      const indices = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices)
      const indexData = accessorData(gltf, bin, primitive.indices, true); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexData, gl.STATIC_DRAW)
      primitives.set(primitive, { position, normal, indices, count: indexData.length, type: indexData instanceof Uint32Array ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT })
    }
    if (stopped) return
    sceneData = { gltf, primitives, dynamicWheel: buildDynamicWheel(gl, initialItems, initialPal) }
    onReady?.()
  }
  load().catch((error) => { if (!stopped && error.name !== 'AbortError') onReady?.(error) })
  draw()
  return {
    spinTo: (degrees, duration) => {
      const target = -degrees * Math.PI / 180
      const from = spinAngle; const start = performance.now(); const ms = Math.max(100, duration * 1000)
      const animate = (now) => { const t = Math.min(1, (now - start) / ms); spinAngle = from + (target - from) * (1 - (1 - t) ** 4); if (t < 1 && !stopped) requestAnimationFrame(animate) }
      requestAnimationFrame(animate)
    },
    setItems: (items, pal) => {
      if (!sceneData) return
      for (const segment of sceneData.dynamicWheel.segments) gl.deleteBuffer(segment.buffer)
      gl.deleteTexture(sceneData.dynamicWheel.texture); gl.deleteBuffer(sceneData.dynamicWheel.quad)
      sceneData.dynamicWheel = buildDynamicWheel(gl, items, pal)
    },
    dispose: () => {
      stopped = true
      loadController.abort()
      cancelAnimationFrame(frame)
      gl.deleteBuffer(pointer.gold.buffer); gl.deleteBuffer(pointer.red.buffer)
      // Keep the browser's context alive: React StrictMode remounts this viewer during development.
    },
  }
}

export function GlbViewer({ rotation, duration, items, pal, onReady, onError }) {
  const canvasRef = useRef(null)
  const rendererRef = useRef(null)
  const callbacksRef = useRef({ onReady, onError })
  callbacksRef.current = { onReady, onError }
  useEffect(() => {
    try { rendererRef.current = initRenderer(canvasRef.current, items, pal, (error) => error ? callbacksRef.current.onError?.(error) : callbacksRef.current.onReady?.()) }
    catch (error) { callbacksRef.current.onError?.(error) }
    return () => rendererRef.current?.dispose()
  }, [])
  useEffect(() => { rendererRef.current?.spinTo(rotation, duration) }, [rotation, duration])
  useEffect(() => { rendererRef.current?.setItems(items, pal) }, [items, pal])
  return <canvas ref={canvasRef} className="h-full w-full" aria-label="3D prize wheel." />
}
