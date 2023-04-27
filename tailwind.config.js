module.exports = {
    content: ["./src/routes/**/*.{svelte,js,ts}"],
    theme: {
        extends: {
            textColor: {
                skin: {
                    text: "var(--color-text)",
                },
            },
            backgroundColor: {
                skin: {
                    fill: "var(--color-fill)",
                    accent: "var(--color-fill-accent)",
                    hover: "var(--color-fill-accent-hover)",
                },
            },
        },
    },
};
