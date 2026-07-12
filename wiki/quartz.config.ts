import { QuartzConfig } from "./quartz/cfg"
import * as Plugin from "./quartz/plugins"

/**
 * Quartz 4 Configuration
 *
 * See https://quartz.jzhao.xyz/configuration for more information.
 */
const config: QuartzConfig = {
  configuration: {
    pageTitle: "agile-board",
    pageTitleSuffix: "",
    enableSPA: true,
    enablePopovers: true,
    analytics: null,
    locale: "en-US",
    baseUrl: "agile-board.duckdns.org/wiki",
    ignorePatterns: ["private", "templates", ".obsidian", "_TEMPLATE.md"],
    defaultDateType: "modified",
    theme: {
      // Barlow is self-hosted (OFL) from quartz/static/fonts via @font-face in
      // styles/custom.scss — fontOrigin "local" tells Quartz not to fetch Google.
      fontOrigin: "local",
      cdnCaching: true,
      typography: {
        header: "Barlow",
        body: "Barlow",
        code: "IBM Plex Mono",
      },
      // Brand palette. Quartz colour roles: light=page bg, dark=headings,
      // darkgray=body, secondary=links/title, tertiary=hover, lightgray=borders,
      // gray=muted/graph, highlight=link bg. Swap these to reskin.
      colors: {
        lightMode: {
          light: "#FFFFFF",
          lightgray: "#E2E5E9",
          gray: "#9AA1AC",
          darkgray: "#1D1D1F",
          dark: "#000000",
          secondary: "#0066FF",   // brand blue
          tertiary: "#0052D6",
          highlight: "rgba(0, 102, 255, 0.10)",
          textHighlight: "#0066ff22",
        },
        darkMode: {
          light: "#0A1230",       // deep navy page bg
          lightgray: "#2A3A66",
          gray: "#6E7CA8",
          darkgray: "#E8ECF5",
          dark: "#FFFFFF",
          secondary: "#6BA8FF",   // lighter brand blue on navy
          tertiary: "#A4CEF4",    // Azul Bebê
          highlight: "rgba(77, 148, 255, 0.15)",
          textHighlight: "#4d94ff33",
        },
      },
    },
  },
  plugins: {
    transformers: [
      Plugin.FrontMatter(),
      Plugin.CreatedModifiedDate({
        priority: ["frontmatter", "git", "filesystem"],
      }),
      Plugin.SyntaxHighlighting({
        theme: {
          light: "github-light",
          dark: "github-dark",
        },
        keepBackground: false,
      }),
      Plugin.ObsidianFlavoredMarkdown({ enableInHtmlEmbed: false }),
      Plugin.GitHubFlavoredMarkdown(),
      Plugin.TableOfContents(),
      Plugin.CrawlLinks({ markdownLinkResolution: "shortest" }),
      Plugin.Description(),
    ],
    filters: [Plugin.RemoveDrafts()],
    emitters: [
      Plugin.AliasRedirects(),
      Plugin.ComponentResources(),
      Plugin.ContentPage(),
      Plugin.FolderPage(),
      Plugin.TagPage(),
      Plugin.ContentIndex({
        enableSiteMap: true,
        enableRSS: true,
      }),
      Plugin.Assets(),
      Plugin.Static(),
      Plugin.Favicon(),
      Plugin.NotFoundPage(),
      // CustomOgImages (satori/resvg font rendering) and Latex/katex dropped:
      // story content has no math, and this build runs on a small VM on every
      // push, not once on a laptop -- skip the plugins this project never uses.
    ],
  },
}

export default config
