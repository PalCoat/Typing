module.exports = {
    content: ["./src/routes/**/*.{svelte,js,ts}"],
    theme: {
        extend: {
            textColor: {
                skin: {
                    text: "var(--color-text)",
                },
            },
            backgroundColor: {
                skin: {
                    fill: "var(--color-fill)",
                    accent: "var(--color-fill-accent)",
                    secondary_accent: "var(--color-fill-secondary_accent)",
                    hover: "var(--color-fill-accent-hover)",
                },
            },
        },
    },
};
