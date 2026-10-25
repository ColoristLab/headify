export default (ctx: { file: { name: string } }) => `mts:${ctx.file.name}`;
