var inherits = require('inherits');
var Auth = require('auth');
var AuthRequiredCommand = require('streamhub-sdk/ui/auth-required-command');
var Command = require('streamhub-sdk/ui/command');
var LivefyreContent = require('streamhub-sdk/content/types/livefyre-content');
var Observer = require('observer');
var Editor = require('streamhub-editor');
var editorStyles = require('less!streamhub-editor/styles/editor.less');
var template = require('hgn!streamhub-editor/templates/auth-editor');
var debug = require('streamhub-sdk/debug');

var log = debug('AuthEditor');

'use strict';

/**
 * Auth Editor view.
 * @constructor
 * @extends {View}
 * @param {Object} [opts] Config options.
 * @param {Collection} [opts.collection] The collection being written to
 * @param {number} [opts.contentParentId] The content id being replied to
 */
var AuthEditor = function (opts) {
    opts = opts || {};
    this._collection = opts.collection;

    Observer(this);
    this.listenTo(Auth, 'login.livefyre', function () { this.handleLogin.apply(this, arguments); }.bind(this));
    this.listenTo(Auth, 'logout', function () { this.handleLogout.apply(this, arguments); }.bind(this));

    this._user = Auth.get('livefyre');

    this._contentParentId = opts.contentParentId
    this._showAvatar = opts.showAvatar === undefined ? true : opts.showAvatar;

    this._postCmd = new Command(Editor.prototype._handlePostBtnClick.bind(this));
    this._authCmd = new AuthRequiredCommand(this._postCmd);

    Editor.call(this, opts);
};
inherits(AuthEditor, Editor);

AuthEditor.prototype.template = template;
AuthEditor.prototype.elClass = 'content-editor';

/**
 * Set the user and rerender
 * @param {?User} livefyreUser
 */
AuthEditor.prototype.handleLogin = function (livefyreUser) {
    this._user = livefyreUser;
    this.render();
};

/** Unset the user and rerender */
AuthEditor.prototype.handleLogout = function () {
    this._user = null;
    this.render();
};

/**
 * Handle the keydown event in the textarea.
 * @param {jQuery.Event} ev
 * @private
 */
AuthEditor.prototype._handleEditorKeydown = function (ev) {
    ev.stopPropagation();
    this._resize();
    var isEnter = ev.keyCode === 13;
    if (!isEnter || ev.shiftKey) {
        return;
    }
    ev.preventDefault();
    this._authCmd.execute();
};

/**
 * Handle the post button click event. This should validate the data and
 * dispatch a post event that a controller can handle.
 */
AuthEditor.prototype._handlePostBtnClick = function() {
    var data = this.buildPostEventObj();
    if (!this.validate(data)) {
        return;
    }
    this._authCmd.execute();
};

/** @override */
AuthEditor.prototype.sendPostEvent = function (ev) {
    if (! this._collection) {
        log('Cannot write to undefined collection');
        return;
    }

    var newContent = new LivefyreContent();
    newContent.author = this._user.get();
    newContent.body = ev.body;
    newContent.createdAt = new Date();
    newContent.collection = this._collection;
    if (this._contentParentId) {
        newContent.parentId = this._contentParentId;
    }

    function writeCollection() {
        this._collection.write(newContent, this._handleWrite.bind(this));
    }
    writeCollection.call(this);

    this._retry = writeCollection.bind(this);

    this.$el.trigger('writeContent.hub', newContent);
};

AuthEditor.prototype._handleWrite = function (err, data) {
    if (err) {
        this.$el.trigger('writeFailure.hub', { error: err, retry: this._retry });
        return;
    }
    this.$el.trigger('writeSuccess.hub');
};

AuthEditor.prototype.setCollection = function (collection) {
    this._collection = collection;
};

AuthEditor.prototype.setContentParentId = function (contentParentId) {
    this._contentParentId = contentParentId;
};

AuthEditor.prototype.getTemplateContext = function () {
    var context = Editor.prototype.getTemplateContext.call(this);
    if (this._user) {
        context.showAvatar = this._showAvatar;
        context.avatarUrl = this._user.get('avatar');
    }
    return context;
};

module.exports = AuthEditor;
