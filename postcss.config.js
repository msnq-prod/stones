export default {
    plugins: {
        '@tailwindcss/postcss': {},
        autoprefixer: {}, // autoprefixer is usually included in tailwind v4 postcss plugin or not needed as much, but safely kept or removed?
        // Tailwind v4 usually includes autoprefixing.
        // But let's verify. The error said "install @tailwindcss/postcss".
    },
}
