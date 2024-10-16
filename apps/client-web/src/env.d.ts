/// <reference types="vite/client" />

declare module '*.vue' {
  import { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component
}

/** 處理響應式圖片引入格式 */
declare module "*&imagetools" {
  /**
   * actual types
   * - code https://github.com/JonasKruckenberg/imagetools/blob/main/packages/core/src/output-formats.ts
   * - docs https://github.com/JonasKruckenberg/imagetools/blob/main/docs/guide/getting-started.md#metadata
   */
  const out: any;
  export default out;
}

interface OutputMetadata {
  src: string // URL of the generated image
  width: number // Width of the image
  height: number // Height of the image
  format: string // Format of the generated image

  // The following options are the same as sharps input options
  space?: string // Name of color space interpretation
  channels?: number // Number of bands e.g. 3 for sRGB, 4 for CMYK
  density?: number //  Number of pixels per inch
  depth?: string // Name of pixel depth format
  hasAlpha?: boolean // presence of an alpha transparency channel
  hasProfile?: boolean // presence of an embedded ICC profile
  isProgressive?: boolean // indicating whether the image is interlaced using a progressive scan
}
declare module "*&metadata" {
  /**
   * actual types
   * - code https://github.com/JonasKruckenberg/imagetools/blob/main/packages/core/src/output-formats.ts
   * - docs https://github.com/JonasKruckenberg/imagetools/blob/main/docs/guide/getting-started.md#metadata
   */
  const out: OutputMetadata | OutputMetadata[];
  export default out;
}

declare interface ImportMetaEnv {
  /** 版本號 */
  readonly PACKAGE_VERSION: string;
}
