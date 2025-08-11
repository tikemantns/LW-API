// Type declarations for modules without official TypeScript support

declare module 'xss-clean' {
    import { RequestHandler } from 'express'
    function xssClean(): RequestHandler
    export = xssClean
}
