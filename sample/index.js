require([
  'livefyre-auth',
  'auth/contrib/auth-button',
  'streamhub-editor',
  'streamhub-editor/auth-editor',
], function (livefyreAuth, createAuthButton, Editor, AuthEditor) {
  livefyreAuth.delegate(livefyreAuth.createDelegate('http://www.qa-ext.livefyre.com'));
  createAuthButton(livefyreAuth, document.getElementById('auth-button'));


  var editor = new Editor({
    el: document.getElementById('content-editor')
  });

  editor.render();

  var authEditor = new AuthEditor({
    el: document.getElementById('content-editor-auth'),
    showTitle: true
  });

  authEditor.render();
});
