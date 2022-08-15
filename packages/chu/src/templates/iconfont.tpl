@font-face {
  font-family: '{{iconfontClassName}}';
  {{#eotType}}
  src: url('{{basePath}}.eot');
  src: url('{{basePath}}.eot?#iefix') format('embedded-opentype'),
  {{/eotType}}
  {{#expectEotSrc}}src:{{/expectEotSrc}}{{#woff2Type}}url('{{basePath}}.woff2') format('woff2'),
  {{/woff2Type}}
  {{#woffType}}
  url('{{basePath}}.woff') format('woff'),
  {{/woffType}}
  {{#ttfType}}
  url('{{basePath}}.ttf') format('truetype'),
  {{/ttfType}}
  {{#svgType}}
  url('{{basePath}}.svg#iconfont') format('svg');
  {{/svgType}}
}

{{#tempIconfontClassData}}
.{{iconfontClassName}}{
    font-family:"{{iconfontClassName}}" !important;
    font-size:16px;
    font-style:normal;
    -webkit-font-smoothing: antialiased;
    -webkit-text-stroke-width: 0.2px;
    -moz-osx-font-smoothing: grayscale;
}
{{/tempIconfontClassData}}
