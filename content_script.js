class CorezoidDeployShortcut {
  constructor() {
    this.deploy_button_selector = '[el="ProcSave"]';
    this.deploy_button_classes = ['ed__header__status__name', 'ed__header__status__save', 'e__viewMode'];
    this.init();
  }

  async init() {
    const is_valid_page = await this.check_valid_page();
    if (is_valid_page) {
      this.add_keyboard_listener();
      console.log('Corezoid Deploy Shortcut: Extension activated on this page');
    }
  }

  async check_valid_page() {
    const current_url = window.location.href;
    const configured_domains = await this.get_configured_domains();
    
    return configured_domains.some(domain => {
      const pattern = new RegExp(`^${domain.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/[^/]+/process/\\d+`);
      return pattern.test(current_url);
    });
  }

  async get_configured_domains() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['configured_domains'], (result) => {
        const default_domains = ['https://admin.corezoid.com'];
        resolve(result.configured_domains || default_domains);
      });
    });
  }

  add_keyboard_listener() {
    document.addEventListener('keydown', (event) => {
      const is_ctrl_s = (event.ctrlKey || event.metaKey) && event.key === 's';
      if (is_ctrl_s) {
        event.preventDefault();
        this.trigger_deploy();
      }
    });
  }

  trigger_deploy() {
    const deploy_button = this.find_deploy_button();
    
    if (deploy_button) {
      deploy_button.click();
      console.log('Corezoid Deploy Shortcut: Deploy action triggered via keyboard shortcut');
    } else {
      console.log('Corezoid Deploy Shortcut: Deploy button not available - process cannot be deployed at this time');
    }
  }

  find_deploy_button() {
    const deploy_button = document.querySelector(this.deploy_button_selector);
    
    if (!deploy_button) {
      return null;
    }

    const has_required_classes = this.deploy_button_classes.every(className => 
      deploy_button.classList.contains(className)
    );

    const is_visible = deploy_button.offsetParent !== null && 
                      getComputedStyle(deploy_button).display !== 'none';

    if (has_required_classes && is_visible) {
      return deploy_button;
    }

    return null;
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new CorezoidDeployShortcut());
} else {
  new CorezoidDeployShortcut();
}
