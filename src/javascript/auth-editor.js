/**
 * @fileOverview The editor view class. This contains the editor box and any
 * buttons that go along with it.
 */

var $ = require('jquery');
var inherits = require('inherits');
var Auth = require('auth');
var AuthRequiredCommand = require('streamhub-sdk/ui/auth-required-command');
var Command = require('streamhub-sdk/ui/command');
var LivefyreContent = require('streamhub-sdk/content/types/livefyre-content');
var Observer = require('observer');
var Editor = require('streamhub-editor');
var template = require('hgn!streamhub-editor/templates/auth-editor');

/**
 * Auth Editor view.
 * @constructor
 * @extends {View}
 * @param {Object} opts Config options.
 */
var AuthEditor = function (opts) {
    Observer(this);
    this.listenTo(Auth, 'login.livefyre', this.handleLogin.bind(this));
    this.listenTo(Auth, 'logout', this.handleLogout.bind(this));

    this._content = opts.content;
    this._showAvatar = opts.showAvatar === undefined ? true : opts.showAvatar;

    this._postCmd = new Command(this._handlePostBtnClick.bind(this));
    this._authCmd = new AuthRequiredCommand(this._postCmd);

    this._user = Auth.get('livefyre');

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
    newContent.parentId = this._content.id;
    this._content.collection.write(newContent, this._handleWrite.bind(this));
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
