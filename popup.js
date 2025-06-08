class PopupManager {
  constructor() {
    this.init();
  }

  async init() {
    await this.check_page_status();
    this.add_event_listeners();
  }

  async check_page_status() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const configured_domains = await this.get_configured_domains();
      
      const is_valid_page = configured_domains.some(domain => {
        const pattern = new RegExp(`^${domain.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/[^/]+/process/\\d+`);
        return pattern.test(tab.url);
      });

      const status_div = document.getElementById('page-status');
      if (is_valid_page) {
        status_div.textContent = '✓ Extension active on this page';
        status_div.className = 'status active';
      } else {
        status_div.textContent = '✗ Extension not active on this page';
        status_div.className = 'status inactive';
      }
    } catch (error) {
      console.error('Error checking page status:', error);
    }
  }

  async get_configured_domains() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['configured_domains'], (result) => {
        const default_domains = ['https://admin.corezoid.com'];
        resolve(result.configured_domains || default_domains);
      });
    });
  }

  add_event_listeners() {
    document.getElementById('open-options').addEventListener('click', () => {
      chrome.runtime.openOptionsPage();
    });
  }
}

new PopupManager();
