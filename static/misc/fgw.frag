#ifdef GL_ES
precision mediump float;
#endif

uniform sampler2D state;
uniform vec2 scale;

vec4 get(int x, int y) {
    return texture2D(state, (gl_FragCoord.xy + vec2(x, y)) / scale);
}

void main() {
    vec4 curr = get(0, 0);
    vec4 sum = get(-1, -1) +
              get(-1,  0) +
              get(-1,  1) +
              get( 0, -1) +
              get( 0,  1) +
              get( 1, -1) +
              get( 1,  0) +
              get( 1,  1);
      if (curr.x > 0.0) {
        if (sum.z > 2.0) {
          gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);
        } else {
          gl_FragColor = curr;
        }
      } else if (curr.y > 0.0) {
        if (sum.x > 2.0) {
          gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
        } else {
          gl_FragColor = curr;
        }
      } else if (curr.z > 0.0) {
        if (sum.y > 2.0) {
          gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0);
        } else {
          gl_FragColor = curr;
        }
      }
}