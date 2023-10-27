import babel from '@rollup/plugin-babel';
import nodeResolve from '@rollup/plugin-node-resolve';

const targets = 'node 18';
const extensions = ['.ts', '.js'];

export default {
  input: './src/index.ts',
  output: {
    file: 'dist/index.js',
    format: 'cjs',
  },
  plugins: [
    nodeResolve({ extensions }),
    babel({
      babelrc: false,
      configFile: false,
      targets,
      extensions,
      babelHelpers: 'bundled',
      presets: [['@babel/preset-env', { targets }], '@babel/preset-typescript'],
    }),
  ],
};
