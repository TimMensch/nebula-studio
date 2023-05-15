declare module '*.svg';
declare module '*.png';
declare module '*.jpg';
declare module '*.jpeg';
declare module '*.gif';
declare module '*.bmp';
declare module '*.tiff';
declare module '*.less';
 
interface Window {
  gConfig: {
    maxBytes: number
    databaseName: string;
  };
  __ngqlRunner__: any;
}
