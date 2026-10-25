export default (ctx: { file: { name: string } }) => `ts:${ctx.file.name}`;
