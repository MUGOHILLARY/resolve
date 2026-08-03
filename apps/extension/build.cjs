const esbuild = require("esbuild");

const watch = process.argv.includes("--watch");

const options = {
  entryPoints: {
    background: "./background.ts",
    content: "./content.ts",
    blocked: "./blocked.ts",
  },

  outdir: ".",

  // Bundle dependencies into each entry point
  bundle: true,

  format: "esm",

  platform: "browser",

  target: ["chrome120"],

  sourcemap: false,

  logLevel: "info",
};

async function run() {
  if (watch) {
    const ctx = await esbuild.context(options);
    await ctx.watch();
    console.log("👀 Watching...");
  } else {
    await esbuild.build(options);
    console.log("✅ Build complete");
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});