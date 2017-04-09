#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D state;
uniform vec2 scale;

vec4 get(int x, int y) {
    return texture2D(state, (gl_FragCoord.xy + vec2(x, y)) / scale);
}

void main() {
    vec4 sum = get(-1, -1) +
              get(-1,  0) +
              get(-1,  1) +
              get( 0, -1) +
              get( 0,  1) +
              get( 1, -1) +
              get( 1,  0) +
              get( 1,  1);
    vec4 current = get(0, 0);
    if (current.y == 0.0) {
      if (sum.y == 6.0 || sum.y == 5.0) {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
      } else {
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
      }
    } else {
      if (sum.y == 5.0) {
        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
      } else {
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0);
      }
    }
}