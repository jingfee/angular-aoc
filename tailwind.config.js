module.exports = {
  content: ["./apps/aoc/src/**/*.{html,ts}"],
  media: false, // or 'media' or 'class'
  theme: {
    extend: {
      fontFamily: {
        'mono': ['UbuntuMono']
      }
    },
  },
  variants: {
    extend: {},
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('@tailwindcss/forms')
  ],
}
