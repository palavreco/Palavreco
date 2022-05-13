declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL: string;
      TOKEN: string,
      CLIENT_ID: string,
      GUILD_ID: string
      SUG_CHANNEL: string,
      BUG_CHANNEL: string,
      GUILD_UPDATE_CHANNEL: string;
    }
  }
}

export { };
