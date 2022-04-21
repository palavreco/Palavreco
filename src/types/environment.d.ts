declare global {
  namespace NodeJS {
    interface ProcessEnv {
      TOKEN: string,
      CLIENT_ID: string,
      GUILD_ID: string
      SUG_CHANNEL: string,
      BUG_CHANNEL: string,
    }
  }
}

export { };
