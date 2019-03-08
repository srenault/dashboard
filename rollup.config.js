import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { uglify } from 'rollup-plugin-uglify';
import babel from 'rollup-plugin-babel';
import postcss from 'rollup-plugin-postcss';
import replace from 'rollup-plugin-replace';
import size from 'rollup-plugin-size';

const target = process.env.target || 'dev';

const production = target === 'prod';

const config = require(`./env/${target}.js`);

export default {
  input: 'src/index.js',
  output: {
    file: 'www/js/bundle.js',
    format: 'iife',
    sourcemap: true,
    globals: {
      react: "React"
    },
  },
  plugins: [
    size(),
    postcss({
      minimize: production,
    }),
    resolve(),
    babel({
      runtimeHelpers: true,
      exclude: 'node_modules/**',
    }),
    commonjs({
      namedExports: {
        'node_modules/react/index.js': ['Children', 'Component', 'PropTypes', 'createElement', 'useState', 'useEffect', 'useRef', 'useDebugValue', 'useMemo', 'useCallback'],
        'node_modules/react-dom/index.js': ['render'],
      },
    }),
    replace({
      'process.env.NODE_ENV': production ? JSON.stringify('production') : JSON.stringify('development'),
    }),
    replace({
      include: 'src/Config.js',
      delimiters: ['<@', '@>'],
      ...config,
    }),
    production && uglify(),
  ]
};
