import { defineConfig, type DefaultTheme } from "vitepress";
import { groupIconMdPlugin, groupIconVitePlugin } from "vitepress-plugin-group-icons";

import { markdown as enMarkdown } from "../en/config.ts";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "headify",
  base: "/ColoristLab/",
  description: "让版本发布更简单的 CLI",
  rewrites: {
    "zh/:rest*": ":rest*",
  },
  ignoreDeadLinks: false,
  head: [
    ["link", { rel: "icon", href: "/ColoristLab/favicon.svg", type: "image/svg+xml" }],
    [
      "meta",
      {
        name: "google",
        content: `notranslate`,
      },
    ],
  ],
  markdown: {
    container: {
      tipLabel: "提示",
      infoLabel: "信息",
      warningLabel: "警告",
      dangerLabel: "危险",
      detailsLabel: "详细信息",
      noteLabel: "注意",
      importantLabel: "重要",
      cautionLabel: "小心",
    },
    codeCopyButton: {
      tooltipText: "复制代码",
      copiedText: "已复制",
    },
    config(md) {
      md.use(groupIconMdPlugin);
    },
  },
  vite: {
    plugins: [groupIconVitePlugin()],
  },
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: nav(),

    logo: { src: "/logo-mini.svg", width: 24, height: 24 },
    sidebar: [
      {
        text: "Guide",
        items: [
          { text: "Introduction", link: "/index" },
          { text: "Getting Started", link: "/getting-started" },
        ],
      },
    ],
    socialLinks: [
      {
        icon: "github",
        link: "https://github.com/ColoristLab/headify",
      },
    ],

    footer: {
      message: "基于 MIT 许可发布",
      copyright: "版权所有 © 2026-至今 ajiho",
    },

    outline: {
      level: "deep",
      label: "页面导航",
    },

    lastUpdated: {
      text: "最后更新于",
    },

    notFound: {
      title: "页面未找到",
      quote: "但如果你不改变方向，并且继续寻找，你可能最终会到达你所前往的地方。",
      linkLabel: "前往首页",
      linkText: "带我回首页",
    },

    langMenuLabel: "多语言",
    returnToTopLabel: "回到顶部",
    sidebarMenuLabel: "菜单",
    darkModeSwitchLabel: "主题",
    lightModeSwitchTitle: "切换到浅色模式",
    darkModeSwitchTitle: "切换到深色模式",
    skipToContentLabel: "跳转到内容",

    editLink: {
      pattern: "https://github.com/ColoristLab/headify/edit/main/docs/:path",
      text: "在 GitHub 上编辑此页面",
    },
    docFooter: {
      prev: "上一页",
      next: "下一页",
    },
    search: {
      provider: "local",
      options: {
        locales: {
          root: {
            // 如果你想翻译默认语言，请将此处设为 `root`
            translations: {
              button: {
                buttonText: "搜索",
                buttonAriaLabel: "搜索",
              },
              modal: {
                displayDetails: "显示详细列表",
                resetButtonTitle: "重置搜索",
                backButtonTitle: "关闭搜索",
                noResultsText: "没有结果",
                footer: {
                  selectText: "选择",
                  selectKeyAriaLabel: "输入",
                  navigateText: "导航",
                  navigateUpKeyAriaLabel: "上箭头",
                  navigateDownKeyAriaLabel: "下箭头",
                  closeText: "关闭",
                  closeKeyAriaLabel: "Esc",
                },
              },
            },
          },
        },
      },
    },
  },
  locales: {
    root: { label: "简体中文", lang: "zh-Hans", dir: "ltr" },
    en: { label: "English", lang: "en-US", dir: "ltr", markdown: enMarkdown },
  },
});

function nav(): DefaultTheme.NavItem[] {
  return [{ text: "Sponsor", link: "https://www.lujiahao.com/sponsor" }];
}
