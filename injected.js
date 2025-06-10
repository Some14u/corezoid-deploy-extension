'use strict';

const active_popup_view_context = { callback: null, model: null };

function initBackbonePatch() {
  const tryInitialize = () => {
    if (typeof window.Backbone === 'undefined' || !window.Backbone.View) {
      return false;
    }

    const { View: OrigView } = window.Backbone;

    function PatchedView(options, ...args) {
      OrigView.call(this, options, ...args);
      const { isPopup, popupCloseCallback: cb } = this.options;
      if (isPopup && typeof cb === 'function') {
        active_popup_view_context.callback = cb;
        active_popup_view_context.model = this.model;
      }
      this.on('destroy', () => {
        console.log('Corezoid Deploy Shortcut: View destroy event fired', {
          isPopup: this.options?.isPopup,
          hasCallback: !!this.options?.popupCloseCallback,
          currentContextModel: active_popup_view_context.model,
          thisModel: this.model,
          contextWillBeCleared: active_popup_view_context.model === this.model
        });
        
        active_popup_view_context.callback = null;
        active_popup_view_context.model = null;
        
        console.log('Corezoid Deploy Shortcut: Active popup context cleared');
      });
    }

    PatchedView.prototype = Object.create(OrigView.prototype);
    PatchedView.prototype.constructor = PatchedView;
    Object.assign(PatchedView, OrigView, { extend: OrigView.extend });

    window.Backbone.View = PatchedView;
    console.log('Corezoid Deploy Shortcut: Backbone.View patched for popup context tracking');
    return true;
  };

  if (tryInitialize()) {
    return;
  }

  console.log('Corezoid Deploy Shortcut: Backbone not ready, setting up retry mechanism');

  const observer = new MutationObserver(() => {
    if (tryInitialize()) {
      observer.disconnect();
      console.log('Corezoid Deploy Shortcut: Backbone patched successfully via retry mechanism');
    }
  });

  observer.observe(document, { childList: true, subtree: true });

  setTimeout(() => {
    observer.disconnect();
    console.log('Corezoid Deploy Shortcut: Backbone patch initialization timed out after 10 seconds');
  }, 10000);
}

function synchronizeEditorsSrc() {
  const { callback, model } = active_popup_view_context;
  if (typeof callback === 'function' && model?.attributes) {
    callback(model.attributes.src);
    console.log('Corezoid Deploy Shortcut: Editors synchronized successfully');
    return true;
  } else {
    console.log('Corezoid Deploy Shortcut: No valid callback or model for synchronization');
    return false;
  }
}

initBackbonePatch();

window.addEventListener('message', function(event) {
  if (event.source !== window || !event.data.type) {
    return;
  }

  if (event.data.type === 'COREZOID_SYNCHRONIZE_EDITORS') {
    const syncResult = synchronizeEditorsSrc();
    window.postMessage({
      type: 'COREZOID_SYNCHRONIZE_RESULT',
      success: syncResult
    }, '*');
  }
});

console.log('Corezoid Deploy Shortcut: Injected script loaded and ready');
