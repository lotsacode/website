#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D state;
uniform vec2 scale;
uniform float u_time;

vec4 get(int x, int y) {
    return texture2D(state, (gl_FragCoord.xy + vec2(x, y)) / scale);
}

vec4 interact(vec4 a, vec4 b) {
  if (a.x > 0.0) { // Red
    if (b.x > 0.0) { // Red
      return a;
    } else if (b.y > 0.0) { // Green
      return a;
    } else if (b.z > 0.0) { // Blue 
      return b;
    }
  } else if (a.y > 0.0) { // Green
    if (b.x > 0.0) { // Red
      return b;
    } else if (b.y > 0.0) { // Green
      return a;
    } else if (b.z > 0.0) { // Blue 
      return a;
    }
  } else if (a.z > 0.0) { // Blue 
    if (b.x > 0.0) { // Red
      return a;
    } else if (b.y > 0.0) { // Green
      return b;
    } else if (b.z > 0.0) { // Blue 
      return a;
    }
  } else {
    return b;
  }
}

float random (vec2 st) {
  vec2 temp = st + vec2(u_time, u_time);
  return fract(sin(dot(temp.xy, vec2(12.9898,78.233)))*43758.5453123);
}

void main() {
  vec4 c = get(0, 0);
  float rnd = random(gl_FragCoord.xy);
  if (rnd < 1.0/6.0) {
    gl_FragColor = interact(c, get(0, 1));
  } else if (rnd < 2.0/6.0) {
    gl_FragColor = interact(c, get(0, -1));
  } else if (rnd < 3.0/6.0) {
    gl_FragColor = interact(c, get(1, 0));
  } else if (rnd < 4.0/6.0) {
    gl_FragColor = interact(c, get(-1, 0));
  } else if (rnd < 9.0/12.0) {
    gl_FragColor = interact(c, get(1, 1));
  } else if (rnd < 10.0/12.0) {
    gl_FragColor = interact(c, get(-1, 1));
  } else if (rnd < 11.0/12.0) {
    gl_FragColor = interact(c, get(-1, -1));
  } else {
    gl_FragColor = interact(c, get(1, -1));
  };
}