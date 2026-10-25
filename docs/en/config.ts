import { defineAdditionalConfig, type DefaultTheme, type MarkdownLocaleOptions } from "vitepress";

export const markdown: MarkdownLocaleOptions = {
  container: {
    tipLabel: "TIP",
    infoLabel: "INFO",
    warningLabel: "WARNING",
    dangerLabel: "DANGER",
    detailsLabel: "Details",
    noteLabel: "NOTE",
    importantLabel: "IMPORTANT",
    cautionLabel: "CAUTION",
  },
  codeCopyButton: {
    tooltipText: "Copy code",
    copiedText: "Copied",
  },
};

export default defineAdditionalConfig({
  description: "Simplify Your Releases",

  themeConfig: {
    nav: nav(),

    sidebar: [
      {
        text: "Guide",
        items: [
          { text: "Introduction", link: "/index" },
          { text: "Getting Started", link: "/getting-started" },
        ],
      },
    ],

    editLink: {
      pattern: "https://github.com/releaseasy/releaseasy/edit/main/docs/:path",
      text: "Edit this page on GitHub",
    },
    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2026-present ajiho",
    },
    docFooter: {
      prev: "Previous page",
      next: "Next page",
    },
    outline: {
      level: "deep",
      label: "On this page",
    },
    lastUpdated: {
      text: "Last Updated",
      formatOptions: {
        dateStyle: "medium",
        timeStyle: "medium",
        forceLocale: true,
      },
    },
    notFound: {
      title: "PAGE NOT FOUND",
      quote:
        "But if you don't change your direction, and if you keep looking, you may end up where you are heading.",
      linkLabel: "go to home",
      linkText: "Take me home",
    },

    langMenuLabel: "Change language",
    returnToTopLabel: "Return to top",
    sidebarMenuLabel: "Menu",
    darkModeSwitchLabel: "Appearance",
    lightModeSwitchTitle: "Switch to light theme",
    darkModeSwitchTitle: "Switch to dark theme",
    skipToContentLabel: "Skip to content",
  },
});

function nav(): DefaultTheme.NavItem[] {
  return [{ text: "Sponsor", link: "https://www.lujiahao.com/sponsor" }];
}
