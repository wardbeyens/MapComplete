const plugin = require('tailwindcss/plugin');

module.exports = {
  purge: [
    // './**/*.html',
    // './**/*.js',
  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      maxHeight: {
        '65vh': '65vh',
        '20vh': '20vh',
      },
    },
  },
  variants: {
    extend: {
      ringColor: ['hover'],
    },
  },
  plugins: [
    plugin(({ addVariant, e }) => {
      addVariant('landscape', ({ modifySelectors, separator }) => {
        modifySelectors(
          ({ className }) =>
            `.${e(`landscape${separator}${className}`)}:landscape`
        );
      });
    }),
  ],
};
