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

/**
 * Auth Editor view.
 * @constructor
 * @extends {View}
 * @param {Object} opts Config options.
 */
var AuthEditor = function (opts) {
    Editor.call(this, opts);

    Observer(this);

    this._postCmd = new Command(this._handlePostBtnClick.bind(this));
    this._authCmd = new AuthRequiredCommand(this._postCmd);

    this._user = Auth.get('livefyre');

    this.listenTo(Auth, 'login.livefyre', handleLogin.bind(this));
    this.listenTo(Auth, 'logout', handleLogout.bind(this));
};
inherits(AuthEditor, Editor);

/**
 * Set the user and rerender
 * @param {?User} livefyreUser
 */
function handleLogin(livefyreUser) {
    this._user = livefyreUser;
    this.render();
}

/** Unset the user and rerender */
function handleLogout() {
    this._user = null;
    this.render();
}

/** @override */
AuthEditor.prototype.sendPostEvent = function (ev) {
    var newContent = new LivefyreContent();
    newContent.author = this._user._attributes;
    newContent.body = ev.body;
    newContent.createdAt = new Date();
    this.$el.trigger('writeContent.hub', newContent);
};

module.exports = AuthEditor;
