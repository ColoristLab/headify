import loadTemplate from "./load-template.ts";

const defineTemplate = await loadTemplate("./banner.ts");

const banner = await defineTemplate({
  package: {
    name: "dsad",
    version: "dsad",
    author: "ewqee",
  },
  year: "2026",
  contributors: ["jack", "namc"],
});

if (typeof banner !== "string") {
  throw new TypeError("Template must return a string.");
}

console.log(banner);
