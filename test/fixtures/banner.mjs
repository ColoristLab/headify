/** @type {import("headify").BannerTemplate} */
export default ({ package: pkg, year }) => {
  return `/*!
  * ${pkg.name} v${pkg.version} (${pkg.homepage})
  * Copyright 2015-${year} ${pkg.author}
  * Licensed under the ${pkg.license} license
  */`;
};
