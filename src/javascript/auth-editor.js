var inherits = require('inherits');
var Auth = require('auth');
var AuthRequiredCommand = require('streamhub-sdk/ui/auth-required-command');
var Command = require('streamhub-sdk/ui/command');
var LivefyreContent = require('streamhub-sdk/content/types/livefyre-content');
var Observer = require('observer');
var Editor = require('streamhub-editor/editor');
var template = require('hgn!streamhub-editor/templates/auth-editor');

'use strict';

/**
 * Auth Editor view.
 * @constructor
 * @extends {View}
 * @param {Object} [opts] Config options.
 * @param {Collection} [opts.collection] The collection being written to
 * @param {Content} [opts.content] The content being replied to
 */
var AuthEditor = function (opts) {
    opts = opts || {};
    if (!opts.content) {
        throw 'AuthEditor expects opts.content';
    }
    Observer(this);
    this.listenTo(Auth, 'login.livefyre', function () { this.handleLogin.apply(arguments); }.bind(this));
    this.listenTo(Auth, 'logout', function () { this.handleLogout.apply(arguments); }.bind(this));

    this._user = Auth.get('livefyre');

    this._content = opts.content;
    this._collection = this._content.collection || opts.collection;
    if (!this._collection) {
        throw 'AuthEditor expects opts.content.collection to be defined or opts.collection to be specified';
    }

    this._showAvatar = opts.showAvatar === undefined ? true : opts.showAvatar;

    this._postCmd = new Command(this._handlePostBtnClick.bind(this));
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

/** @override */
AuthEditor.prototype.sendPostEvent = function (ev) {
    var newContent = new LivefyreContent();
    newContent.author = this._user.get();
    newContent.body = ev.body;
    newContent.createdAt = new Date();
    if (this._content) {
        newContent.parentId = this._content.id;
    }
    this._collection.write(newContent, this._handleWrite.bind(this));
};

AuthEditor.prototype._handleWrite = function (err, data) {
    if (err) {
        this.$el.trigger('writeFail.hub');
        return;
    }
    this.$el.trigger('writeSuccess.hub');
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
