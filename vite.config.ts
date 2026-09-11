import { defineConfig, type Plugin } from "vite";
import { cool } from "@cool-vue/unix";
import tailwindcss from "tailwindcss";
import { join } from "node:path";
import uni from "@dcloudio/vite-plugin-uni";
import { buildH5VersionCheckScript } from "./scripts/h5-version-check";

const resolve = (dir: string) => join(__dirname, dir);

/** 构建时写入 version.json，注入 __APP_BUILD_VERSION__，并在 index.html 写入版本标记与检测脚本 */
function h5VersionPlugin(): Plugin {
	const buildVersion = `${Date.now()}`;
	let isProdBuild = false;
	return {
		name: "h5-version",
		config(_config, { command }) {
			isProdBuild = command == "build";
			const version = command == "serve" ? "dev" : buildVersion;
			return {
				define: {
					__APP_BUILD_VERSION__: JSON.stringify(version)
				}
			};
		},
		transformIndexHtml(html) {
			let next = html;
			const versionMeta = `<meta name="app-build-version" content="${buildVersion}" />`;
			const metaPattern = /<meta name="app-build-version" content="[^"]*"\s*\/?>/;
			const inlineScriptPattern =
				/<script>\s*\(function \(\) \{[\s\S]*?window\.__h5CheckVersion[\s\S]*?<\/script>\s*/;

			if (metaPattern.test(next)) {
				next = next.replace(metaPattern, versionMeta);
			} else {
				next = next.replace("<title>", `${versionMeta}\n\t\t<title>`);
			}

			if (isProdBuild) {
				const inlineScript = buildH5VersionCheckScript(buildVersion);
				next = next.replace(inlineScriptPattern, "");
				next = next.replace(versionMeta, `${versionMeta}\n\t\t${inlineScript}`);
			}
			return next;
		},
		generateBundle() {
			this.emitFile({
				type: "asset",
				fileName: "version.json",
				source: JSON.stringify({ version: buildVersion })
			});
		}
	};
}

export default defineConfig({
	base:
		process.env.UNI_PLATFORM == "h5" && process.env.NODE_ENV == "production"
			? "/Enterprise-Systems-Web/"
			: "/",

	plugins: [
		uni(),
		cool({
			proxy: {}
		}),
		h5VersionPlugin()
	],

	server: {
		port: 9900
	},

	css: {
		postcss: {
			plugins: [tailwindcss({ config: resolve("./tailwind.config.ts") })]
		}
	}
});
