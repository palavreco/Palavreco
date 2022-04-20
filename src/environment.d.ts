declare global {
  namespace NodeJS {
    interface ProcessEnv {
      TOKEN: string,
      SUG_CHANNEL: string,
      BUG_CHANNEL: string
    }
  }
}

export { };