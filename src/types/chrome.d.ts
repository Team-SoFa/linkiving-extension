declare namespace chrome {
  namespace storage {
    namespace local {
      function get(key: string): Promise<Record<string, unknown>>;
      function set(items: Record<string, unknown>): Promise<void>;
    }
  }

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
      active?: boolean;
      lastAccessed?: number;
    }

    function query(
      queryInfo: { active?: boolean; currentWindow?: boolean; lastFocusedWindow?: boolean },
      callback?: (tabs: Tab[]) => void
    ): Promise<Tab[]>;

    function sendMessage<TResponse = unknown>(
      tabId: number,
      message: unknown,
      callback?: (response: TResponse) => void
    ): Promise<TResponse>;

    const onActivated: {
      addListener(callback: (activeInfo: { tabId: number }) => void): void;
    };

    const onUpdated: {
      addListener(
        callback: (
          tabId: number,
          changeInfo: { status?: string; url?: string },
          tab: Tab
        ) => void
      ): void;
    };
  }

  namespace scripting {
    function executeScript(details: {
      target: { tabId: number };
      files: string[];
    }): Promise<unknown[]>;
  }

  namespace action {
    function setTitle(details: { title: string }): Promise<void>;
    function setPopup(details: { tabId?: number; popup: string }): Promise<void>;
  }
}
