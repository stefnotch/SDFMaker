import {Shader} from "./shader.js";
import {ShaderJFA} from "./shaderJFA.js";
import {gl} from "./gl.js";

export class ShaderSDF extends Shader {
    // language=GLSL
    static #SHADER_FRAGMENT = ShaderJFA.SHADER_PACK + `
        uniform highp usampler2D atlas;
        uniform sampler2D source;
        uniform uvec2 size;
        
        in vec2 vUv;

        out vec4 color;

        void main() {
            uint x, y;
            ivec2 atlasCoordinate = ivec2(vUv * vec2(size) + .5);
            uvec2 atlasPixels = texelFetch(atlas, atlasCoordinate, 0).rg;

            jfaUnpack(atlasPixels.x, x, y);
            
            uint x2, y2;
            
            jfaUnpack(atlasPixels.y, x2, y2);
            
            if (texelFetch(source, atlasCoordinate, 0).a > .5)
                color = vec4(texelFetch(source, ivec2(x, y), 0).rgb, 1.);
            else
                color = vec4(texelFetch(source, ivec2(x2, y2), 0).rgb, 1.);
        }
    `;

    #uniformSize;

    constructor(radius, samples) {
        super(ShaderSDF.#SHADER_FRAGMENT);

        this.use();

        gl.uniform1i(this.uniformLocation("atlas"), 0);
        gl.uniform1i(this.uniformLocation("source"), 1);

        this.#uniformSize = this.uniformLocation("size");
    }

    setSize(width, height) {
        gl.uniform2ui(this.#uniformSize, width, height);
    }
}