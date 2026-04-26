declare namespace chrome {
  namespace cookies {
    interface Cookie {
      value?: string;
    }

    function get(details: { url: string; name: string }): Promise<Cookie | null>;
  }

  namespace tabs {
    interface Tab {
      id?: number;
      url?: string;
    }

    function query(
      queryInfo: { active?: boolean; currentWindow?: boolean },
      callback?: (tabs: Tab[]) => void
    ): Promise<Tab[]>;

    function sendMessage<TResponse = unknown>(
      tabId: number,
      message: unknown,
      callback?: (response: TResponse) => void
    ): Promise<TResponse>;
  }

  namespace scripting {
    function executeScript(details: {
      target: { tabId: number };
      files: string[];
    }): Promise<unknown[]>;
  }
}
