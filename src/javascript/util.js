/**
 * @fileoverview Util functions that are useful the other modules.
 */

var util = {};

/**
 * Abstract function. This is wicked awesome for ensuring that all of the
 * functions get overridden when using the inheritance pattern.
 */
util.abstractMethod = function() {
    throw 'Function must be implemented.';
};

/**
 * Convert newline chars to <p> tags
 * @param {string} content
 * @returns {string}
 */
util.normalizeNewlines = function (content) {
    content = content.replace(/(\s*)$/, '');
    content = '<p>' + content.split('\n').join('</p><p>') + '</p>';
    return content;
};

/**
 * Focus a textarea and place the cursor at the end of the text.
 * @param {jQuery.Element}
 */
util.focusAndPlaceCursorAtEnd = function ($textareaEl) {
    var textareaEl = $textareaEl[0];
    $textareaEl.focus();
    if (textareaEl.setSelectionRange) {
        var len = $textareaEl.val().length * 2;  // * 2 works to force the final char.
        textareaEl.setSelectionRange(len, len);
    } else {
        $textareaEl.val($textareaEl.val());
    }
};

module.exports = util;
