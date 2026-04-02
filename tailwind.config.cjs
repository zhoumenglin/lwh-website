/** @type {import('tailwindcss').Config} */
module.exports = {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {},
	},
	plugins: [require("@tailwindcss/typography"),require("daisyui")],
	daisyui: {
		themes: [
			{
				pastel: {
					...require("daisyui/src/theming/themes")["pastel"],
					"primary": "#6bbaa7",
					"primary-content": "#ffffff",
					"secondary": "#89c4b8",
					"accent": "#4da692",
					"neutral": "#5ea0a0",
				},
			},
		],
		darkTheme: "dark",
		logs: false,
	  }
}
