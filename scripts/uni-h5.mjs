import { createRequire } from "node:module";
import { spawnSync } from "node:child_process";

const require = createRequire(import.meta.url);
const uniCli = require.resolve("@dcloudio/vite-plugin-uni/bin/uni.js");
const result = spawnSync(process.execPath, [uniCli, ...process.argv.slice(2)], {
	cwd: process.cwd(),
	env: {
		...process.env,
		UNI_INPUT_DIR: process.cwd()
	},
	stdio: "inherit"
});

if (result.error) {
	throw result.error;
}

process.exit(result.status ?? 1);
