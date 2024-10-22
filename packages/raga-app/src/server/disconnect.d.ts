declare module "disconnect" {
  export class Client {
    database(): Database;
    constructor(options: { consumerKey: string; consumerSecret: string });
  }

  interface Database {
    search(options: { artist: string; track: string; type: "release" }): Promise<SearchResults>;
  }

  interface SearchResults {
    results: SearchResult[];
  }

  interface SearchResult {
    genre: string[];
  }
}
