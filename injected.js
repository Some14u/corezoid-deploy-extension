(function() {
  'use strict';

  const active_popup_view_context = { callback: null, model: null };

  function initBackbonePatch() {
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
    }

    PatchedView.prototype = Object.create(OrigView.prototype);
    PatchedView.prototype.constructor = PatchedView;
    Object.assign(PatchedView, OrigView, { extend: OrigView.extend });

    window.Backbone.View = PatchedView;
    console.log('Corezoid Deploy Shortcut: Backbone.View patched for popup context tracking');
    return true;
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

  window.addEventListener('message', function(event) {
    if (event.source !== window || !event.data.type) {
      return;
    }

    switch (event.data.type) {
      case 'COREZOID_INIT_BACKBONE_PATCH':
        const patchResult = initBackbonePatch();
        window.postMessage({
          type: 'COREZOID_BACKBONE_PATCH_RESULT',
          success: patchResult
        }, '*');
        break;

      case 'COREZOID_SYNCHRONIZE_EDITORS':
        const syncResult = synchronizeEditorsSrc();
        window.postMessage({
          type: 'COREZOID_SYNCHRONIZE_RESULT',
          success: syncResult
        }, '*');
        break;
    }
  });

  console.log('Corezoid Deploy Shortcut: Injected script loaded and ready');
})();
