class OptionsManager {
  constructor() {
    this.default_domains = ['https://admin.corezoid.com'];
    this.current_domains = [];
    this.init();
  }

  async init() {
    await this.load_configuration();
    this.render_domains();
    this.add_event_listeners();
  }

  async load_configuration() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(['configured_domains'], (result) => {
        this.current_domains = result.configured_domains || [...this.default_domains];
        resolve();
      });
    });
  }

  render_domains() {
    const domains_list = document.getElementById('domains-list');
    domains_list.replaceChildren();

    if (this.current_domains.length === 0) {
      const message_paragraph = document.createElement('p');
      message_paragraph.textContent = 'No domains configured. Add at least one domain to use the extension.';
      domains_list.appendChild(message_paragraph);
      return;
    }

    this.current_domains.forEach((domain, index) => {
      const domain_item = document.createElement('div');
      domain_item.className = 'domain-item';
      
      const domain_span = document.createElement('span');
      domain_span.textContent = domain;
      
      const remove_button = document.createElement('button');
      remove_button.className = 'btn btn-danger';
      remove_button.setAttribute('data-index', index.toString());
      remove_button.textContent = 'Remove';
      
      domain_item.appendChild(domain_span);
      domain_item.appendChild(remove_button);
      domains_list.appendChild(domain_item);
    });
  }

  add_event_listeners() {
    document.getElementById('add-domain').addEventListener('click', () => {
      this.add_domain();
    });

    document.getElementById('save-config').addEventListener('click', () => {
      this.save_configuration();
    });

    document.getElementById('reset-config').addEventListener('click', () => {
      this.reset_configuration();
    });

    document.getElementById('domains-list').addEventListener('click', (event) => {
      if (event.target.classList.contains('btn-danger')) {
        const index = parseInt(event.target.dataset.index);
        this.remove_domain(index);
      }
    });

    document.getElementById('new-domain').addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        this.add_domain();
      }
    });
  }

  add_domain() {
    const new_domain_input = document.getElementById('new-domain');
    const new_domain = new_domain_input.value.trim();

    if (this.validate_domain(new_domain)) {
      if (!this.current_domains.includes(new_domain)) {
        this.current_domains.push(new_domain);
        this.render_domains();
        new_domain_input.value = '';
        this.show_status('Domain added successfully', 'success');
      } else {
        this.show_status('Domain already exists', 'error');
      }
    } else {
      this.show_status('Please enter a valid URL (e.g., https://admin.corezoid.com)', 'error');
    }
  }

  remove_domain(index) {
    this.current_domains.splice(index, 1);
    this.render_domains();
    this.show_status('Domain removed successfully', 'success');
  }

  validate_domain(domain) {
    try {
      const url = new URL(domain);
      return url.protocol === 'https:' || url.protocol === 'http:';
    } catch {
      return false;
    }
  }

  save_configuration() {
    chrome.storage.sync.set({ configured_domains: this.current_domains }, () => {
      this.show_status('Configuration saved successfully', 'success');
    });
  }

  reset_configuration() {
    this.current_domains = [...this.default_domains];
    this.render_domains();
    this.show_status('Configuration reset to defaults', 'success');
  }

  show_status(message, type) {
    const status_div = document.getElementById('status');
    status_div.textContent = message;
    status_div.className = type === 'success' ? 'success' : 'error';
    setTimeout(() => {
      status_div.textContent = '';
      status_div.className = '';
    }, 3000);
  }
}

new OptionsManager();
