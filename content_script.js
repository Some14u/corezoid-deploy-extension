class CorezoidDeployShortcut {
  constructor() {
    this.deploy_button_selector = '[el="ProcSave"]';
    this.deploy_button_classes = ['ed__header__status__name', 'ed__header__status__save', 'e__viewMode'];
    this.init();
  }

  async init() {
    const is_valid_page = await this.check_valid_page();
    if (is_valid_page) {
      this.inject_modal_styles();
      this.add_keyboard_listener();
      this.setup_deploy_success_notification();
      console.log('Corezoid Deploy Shortcut: Extension activated on this page');
    }
  }

  inject_modal_styles() {
    const style_id = 'corezoid-deploy-shortcut-styles';
    
    if (document.getElementById(style_id)) {
      return;
    }

    const style_element = document.createElement('style');
    style_element.id = style_id;
    style_element.textContent = `
      body:has(.ed__modal[active="true"]) .ed__modal__code[active=true] {
        z-index: 999998;
      }
    `;
    
    document.head.appendChild(style_element);
    console.log('Corezoid Deploy Shortcut: Modal z-index styles injected');
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
      const is_ctrl_s = (event.ctrlKey || event.metaKey) && event.code === 'KeyS';
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

  setup_deploy_success_notification() {
    const observer = new MutationObserver((_, obs) => {
      const proc_status_element = document.querySelector('div[rel="ProcStatus"]');
      const span_deployed_element = document.querySelector('span[el="SpanDeployed"]');

      if (!proc_status_element || !span_deployed_element) return;

      const proc_status_element_observer = new MutationObserver(() => {
        if (proc_status_element.style.display === 'inline-block' &&
          getComputedStyle(span_deployed_element).display === 'inline') {
          this.show_deploy_success_notification();
        }
      });

      proc_status_element_observer.observe(proc_status_element, {
        attributes: true,
        attributeFilter: ['style']
      });

      console.log('Corezoid Deploy Shortcut: Deploy success notification observer setup complete');
      obs.disconnect();
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  show_deploy_success_notification() {
    console.log('Corezoid Deploy Shortcut: Deploy completed successfully');
    this.create_toast_notification('Process deployed successfully!', 'success');
  }

  create_toast_notification(message, type = 'success') {
    const toast_id = 'corezoid-deploy-toast';
    
    const existing_toast = document.getElementById(toast_id);
    if (existing_toast) {
      existing_toast.remove();
    }

    const toast = document.createElement('div');
    toast.id = toast_id;
    toast.innerHTML = `
      <div class="toast-icon">✓</div>
      <div class="toast-text">Deployed</div>
    `;

    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #28a745;
      color: white;
      padding: 6px 10px;
      border-radius: 4px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      z-index: 99999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 6px;
      transform: translateX(100%);
      transition: transform 0.3s ease-in-out;
      pointer-events: auto;
      white-space: nowrap;
    `;

    const icon = toast.querySelector('.toast-icon');
    icon.style.cssText = `
      background: rgba(255, 255, 255, 0.2);
      border-radius: 50%;
      width: 18px;
      height: 18px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      flex-shrink: 0;
      font-size: 11px;
    `;

    const text = toast.querySelector('.toast-text');
    text.style.cssText = `
      font-weight: 600;
      font-size: 14px;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
    }, 10);

    setTimeout(() => {
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.remove();
        }
      }, 300);
    }, 2000);

    toast.addEventListener('click', () => {
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (toast.parentNode) {
          toast.remove();
        }
      }, 300);
    });
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new CorezoidDeployShortcut());
} else {
  new CorezoidDeployShortcut();
}
