/**
 * @fileOverview The editor view class. This contains the editor box and any
 * buttons that go along with it.
 */

var $ = require('jquery');
var errorTemplate = require('hgn!streamhub-editor/templates/editorerror');
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

    /**
     * Whether placeholders are supported or not.
     * @type {boolean}
     * @private
     */
    this._placeholderSupported = true;

    // overridable strings
    this._i18n = $.extend(true, {}, this._i18n, opts.i18n);
};
inherits(Editor, View);

/** @enum {string} */
Editor.prototype._i18n = {
    PLACEHOLDERTEXT: 'The Call of the Comment',
    POST: 'Post',
    ERRORS: {
        BODY: 'Please add a message',
        GENERIC: 'There was an error'
    }
};

/** @enum {string} */
Editor.prototype.classes = {
    FIELD: 'lf-editor-field',
    FOCUS: 'lf-editor-focus',
    RESIZE: 'lf-editor-resize',
    POST_BTN: 'lf-editor-post-btn'
};

/** @override */
Editor.prototype.events = new EventMap((function() {
    var classes = Editor.prototype.classes;
    var events = {};
    events['blur .' + classes.FIELD] = '_handleEditorBlur';
    events['click .' + classes.POST_BTN] = '_handlePostBtnClick';
    events['focus .' + classes.FIELD] = '_handleEditorFocus';
    events['keydown .' + classes.FIELD] = '_handleEditorKeydown';
    events['keyup .' + classes.FIELD] = '_handleEditorKeyup';
    return events;
})());

/**
 * Get the contents of the editor and do any processing required.
 * @return {string}
 * @private
 */
Editor.prototype._getContents = function () {
    return util.normalizeNewlines(this.$textareaEl.val());
};

/**
 * Handle the blur event in the textarea.
 * @private
 */
Editor.prototype._handleEditorBlur = function () {
    this.$el.toggleClass(this.classes.FOCUS, false);

    if (this._placeholderSupported || this.$textareaEl.val() !== '') {
        return;
    }
    this.$textareaEl.val(this._i18n.PLACEHOLDERTEXT);
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

    if (this.$textareaEl.val() !== this._i18n.PLACEHOLDERTEXT) {
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
    this._handlePostBtnClick();
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
 * Handle the post button click event. This should validate the data and
 * dispatch a post event that a controller can handle.
 */
Editor.prototype._handlePostBtnClick = function() {
    var data = this.buildPostEventObj();
    if (!this._validate(data)) {
        return;
    }
    this.sendPostEvent(data);
};

/**
 * Post failure callback.
 * @param {Object} data The response data.
 */
Editor.prototype._handlePostFailure = util.abstractMethod;

/**
 * Post success callback.
 * @param {Object} data The response data.
 */
Editor.prototype._handlePostSuccess = util.abstractMethod;

/**
 * Process the placeholder shenanigans that need to happen because IE 9- doesn't
 * support placeholders on textareas.
 * @private
 */
Editor.prototype._processPlaceholders = function () {
    if (this.$textareaEl[0].placeholder !== undefined) {
        this.$textareaEl.attr('placeholder', this._i18n.PLACEHOLDERTEXT);
        return;
    }
    this._placeholderSupported = false;
    this.$textareaEl.val(this._i18n.PLACEHOLDERTEXT);
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
 * Validate the post data.
 * @param {Object} data The post data to be validated.
 * @return {boolean} Whether the post data is valid or not.
 */
Editor.prototype._validate = function(data) {
    if (!data.body) {
        this.showError(this._i18n.ERRORS.BODY);
        return false;
    }
    return true;
};

/**
 * Build the post event object that will be dispatched from the editor.
 * @return {Object} The post event object.
 */
Editor.prototype.buildPostEventObj = function() {
    var event = {};
    event.body = this.$textareaEl.val();
    event.failure = $.proxy(this._handlePostFailure, this);
    event.success = $.proxy(this._handlePostSuccess, this);
    return event;
};

/**
 * Focus on the textarea.
 */
Editor.prototype.focus = function () {
    util.focusAndPlaceCursorAtEnd(this.$textareaEl);
};

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
            post: this._i18n.POST
        }
    };
};

/** @override */
Editor.prototype.render = function() {
    var currentText = this.$textareaEl ? this.$textareaEl.val() : false;
    View.prototype.render.call(this);
    this.$resizeEl = this.getElementsByClass(this.classes.RESIZE);
    this.$textareaEl = this.getElementsByClass(this.classes.FIELD);
    this.$errorContainer = this.$el;
    this._processPlaceholders();
    currentText && this.$textareaEl.val(currentText);
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
Editor.prototype.showError = function (msg) {
    if (this.$errorEl) {
        return;
    }

    // TODO (mark): Eventually we'll want to have a map for error event types
    // but the SDK only returns error message strings which are useless to us.
    this.$errorEl = $(errorTemplate({msg: msg}));
    this.$errorContainer.append(this.$errorEl);
    this.$errorEl.fadeTo(500, 0.98);
    this.$textareaEl.blur();

    this.$errorEl.one('click', $.proxy(function (ev) {
        ev.stopPropagation();
        this.$errorEl.remove();
        this.$errorEl = null;
        this.focus();
    }, this));
};

module.exports = Editor;
