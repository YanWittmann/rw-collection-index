module.exports = {
    root: true,
    extends: ["react-app", "react-app/jest"],
    rules: {
        "react-hooks/exhaustive-deps": "off",
        "jsx-a11y/anchor-is-valid": "off",
        "react/jsx-no-target-blank": "off",
        "@typescript-eslint/no-unused-vars": "warn"
    }
};
