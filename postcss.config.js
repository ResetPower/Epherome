module.exports = {
  plugins: {
    "postcss-import": {},
    tailwindcss: {},
    ...(process.env.NODE_ENV === "production" ? { cssnano: {} } : {}),
  },
};
