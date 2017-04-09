#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D state;
uniform vec2 scale;
uniform float u_time;

vec4 get(int x, int y) {
    return texture2D(state, (gl_FragCoord.xy + vec2(x, y)) / scale);
}

float dott(vec4 a, vec4 b) {
  return a.r*b.r + a.g*b.g + a.b*b.b;
}

vec4 interact(vec4 a, vec4 b) {
  if (a.b == 0.0) {
    return b;
  } else {
    if (a.r > 0.0 && b.r > 0.0) {
      return a;
    } else if (a.r > 0.0 && b.b > 0.0 || a.b > 0.0 && b.r > 0.0) {
      return vec4(0.0, 0.0, a.b+b.b, 1.0);
    } else {
      return vec4(0.0, 0.0, 0.0, 1.0);
    }
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