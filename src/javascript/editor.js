/**
 * @fileOverview The editor view class. This contains the editor box and any
 * buttons that go along with it.
 */

var $ = require('jquery');
var EventMap = require('view/event-map');
var inherits = require('inherits');
var util = require('streamhub-editor/util');
var View = require('view');

/**
 * Editor view.
 * @constructor
 * @extends {View}
 * @param {Object} opts Config options.
 */
var Editor = function(opts) {
    View.call(this, opts);

    /**
     * The original height of the editor. This is set in the render function
     * so that we know how big to reset the height to.
     * @type {?number}
     * @private
     */
    this._originalHeight = null;

    this.placeholderText = opts.placeholderText || this.placeholderText;

    /**
     * Whether placeholders are supported or not.
     * @type {boolean}
     * @private
     */
    this._placeholderSupported = true;
};
inherits(Editor, View);

/**
 * Handle the blur event in the textarea.
 * @private
 */
Editor.prototype._handleEditorBlur = function () {
    this.$el.toggleClass(this.classes.FOCUS, false);

    if (this._placeholderSupported || this.$textareaEl.val() !== '') {
        return;
    }
    this.$textareaEl.val(this.placeholderText);
};

/**
 * Handle the focus event in the textarea.
 * @private
 */
Editor.prototype._handleEditorFocus = function () {
    this.$el.toggleClass(this.classes.FOCUS, true);

    if (this._placeholderSupported) {
        return;
    }

    if (this.$textareaEl.val() !== this.placeholderText) {
        return;
    }
    this.$textareaEl.val('');
};

/**
 * Handle the keydown event in the textarea.
 * @param {jQuery.Event} ev
 * @private
 */
Editor.prototype._handleEditorKeydown = function (ev) {
    ev.stopPropagation();
    this._resize();
    var isEnter = ev.keyCode === 13;
    if (!isEnter || ev.shiftKey) {
        return;
    }
    ev.preventDefault();
    this.handlePostBtnClick();
};

/**
 * Handle the keyup event in the textarea.
 * @param {jQuery.Event} ev
 * @private
 */
Editor.prototype._handleEditorKeyup = function (ev) {
    ev.preventDefault();
    ev.stopPropagation();
    this._resize();
};

/**
 * Get the contents of the editor and do any processing required.
 * @return {string}
 * @private
 */
Editor.prototype._getContents = function () {
    return util.normalizeNewlines(this.$textareaEl.val());
};

/**
 * Process the placeholder shenanigans that need to happen because IE 9- doesn't
 * support placeholders on textareas.
 * @private
 */
Editor.prototype._processPlaceholders = function () {
    if (this.$textareaEl[0].placeholder !== undefined) {
        this.$textareaEl.attr('placeholder', this.placeholderText);
        return;
    }
    this._placeholderSupported = false;
    this.$textareaEl.val(this.placeholderText);
};

/**
 * Resize the editor.
 * @private
 */
Editor.prototype._resize = function () {
    var content = this.$textareaEl.val();
    var height = 0;
    this.$resizeEl.html(util.normalizeNewlines(content));
    $.each(this.$resizeEl.children(), function (i, child) {
        height += $(child).height();
    });
    this.$textareaEl.height(height);
};

/**
 * Build the post event object that will be dispatched from the editor.
 * @return {Object} The post event object.
 */
Editor.prototype.buildPostEventObj = function() {
    var event = {};
    event.body = this.$textareaEl.val();
    event.failure = $.proxy(this.handlePostFailure, this);
    event.success = $.proxy(this.handlePostSuccess, this);
    return event;
};

/** @enum {string} */
Editor.prototype.classes = {
    FIELD: 'lf-editor-field',
    FOCUS: 'lf-editor-focus',
    RESIZE: 'lf-editor-resize',
    POST_BTN: 'lf-editor-post-btn'
};

/** @enum {string} */
Editor.prototype.errors = {
    BODY: 'Please enter a body'
};

/** @override */
Editor.prototype.events = new EventMap((function() {
    var classes = Editor.prototype.classes;
    var events = {};
    events['blur .' + classes.FIELD] = '_handleEditorBlur';
    events['click .' + classes.POST_BTN] = 'handlePostBtnClick';
    events['focus .' + classes.FIELD] = '_handleEditorFocus';
    events['keydown .' + classes.FIELD] = '_handleEditorKeydown';
    events['keyup .' + classes.FIELD] = '_handleEditorKeyup';
    return events;
})());

/**
 * Focus on the textarea.
 */
Editor.prototype.focus = function () {
    util.focusAndPlaceCursorAtEnd(this.$textareaEl);
};

/**
 * Handle the post button click event. This should validate the data and
 * dispatch a post event that a controller can handle.
 */
Editor.prototype.handlePostBtnClick = function() {
    var data = this.buildPostEventObj();
    if (!this.validate(data)) {
        return;
    }
    this.sendPostEvent(data);
};

/**
 * Post failure callback.
 * @param {Object} data The response data.
 */
Editor.prototype.handlePostFailure = util.abstractMethod;

/**
 * Post success callback.
 * @param {Object} data The response data.
 */
Editor.prototype.handlePostSuccess = util.abstractMethod;


/**
 * Initialize the editor view. This keeps track of the original height of the
 * field and focuses on the textarea.
 * This should be called once the editor is in the DOM.
 */
Editor.prototype.initialize = function () {
    this._originalHeight = this.$textareaEl.height();
    this.focus();
};

/** @override */
Editor.prototype.getTemplateContext = function () {
    return {
        strings: {
            post: 'Post'
        }
    }
};

/** @type {string} */
Editor.prototype.placeholderText = 'The Call of the Comment';

/** @override */
Editor.prototype.render = function() {
    View.prototype.render.call(this);
    this.$resizeEl = this.$('.' + this.classes.RESIZE);
    this.$textareaEl = this.$('.' + this.classes.FIELD);
    this._processPlaceholders();
};

/**
 * Reset the editor back to it's original state.
 */
Editor.prototype.reset = function () {
    this.$resizeEl.html('');
    this.$textareaEl.val('');
    this.$textareaEl.height(this._originalHeight);
};

/** @override */
Editor.prototype.template = require('hgn!streamhub-editor/templates/editor');

/**
 * Send the post event.
 * @param {Object} data The post data to send.
 */
Editor.prototype.sendPostEvent = util.abstractMethod;

/**
 * Show an error message to the user.
 * @param {string} msg The error message to display.
 */
Editor.prototype.showError = util.abstractMethod;

/**
 * Validate the post data.
 * @param {Object} data The post data to be validated.
 * @return {boolean} Whether the post data is valid or not.
 */
Editor.prototype.validate = function(data) {
    if (!data.body) {
        this.showError(this.errors.BODY);
        return false;
    }
    return true;
};

module.exports = Editor;
