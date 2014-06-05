var $ = require('jquery');
var Editor = require('streamhub-editor/editor');
var expect = require('chai').expect;
chai.use(require('sinon-chai'));
var sinon = require('sinon');

describe('streamhub-editor/editor', function() {
    var div, postBtnEl, view, textAreaEl;

    beforeEach(function() {
        div = document.createElement('div');
        view = new Editor({
            el: div
        });
        view.render();
        postBtnEl = view.$('.' + view.classes.POST_BTN);
        textAreaEl = view.$('.' + view.classes.FIELD);
    });

    it('should load with a post button', function() {
        expect(postBtnEl).to.be.visible;
    });

    it('should trigger an event when the post button is clicked', function() {
        view.sendPostEvent = function(){};
        view.$textareaEl.val('test');
        var clickSpy = sinon.spy(view, '_handlePostBtnClick');
        var sendSpy = sinon.spy(view, 'sendPostEvent');
        view.delegateEvents();
        postBtnEl.click();
        assert(clickSpy.called);
        assert(sendSpy.called);
    });

    it('should trigger an event when the enter key is pressed', function () {
        view.sendPostEvent = function(){};
        view.$textareaEl.val('test');
        var keydownSpy = sinon.spy(view, '_handlePostBtnClick');
        var sendSpy = sinon.spy(view, 'sendPostEvent');
        view.delegateEvents();
        textAreaEl.val('hi');
        var e = $.Event("keydown");
        e.which = e.keyCode = 13; // # Enter key code
        $(textAreaEl).trigger(e);
        assert(keydownSpy.called);
        assert(sendSpy.called);
    });

    it('should validate the text in the textarea', function() {
        view.showError = function(){};
        expect(view._validate({body: ''})).to.be.false;
        expect(view._validate({body: 'test'})).to.be.true;
    });

    it('should reset blank field back to placeholder on blur in normal mode', function() {
        view.$textareaEl.val('');
        view.$textareaEl.blur();
        expect(view.$textareaEl.attr('placeholder')).to.equal(view._i18n.PLACEHOLDERTEXT);
    });

    it('should not reset non-empty field back to placeholder on blur in normal mode', function() {
        view.$textareaEl.val('abc');
        view.$textareaEl.blur();
        expect(view.$textareaEl.val()).to.equal('abc');
    });

    it('should reset blank field back to placeholder on blur in hack mode', function() {
        view._placeholderSupported = false;
        view.$textareaEl.val('');
        view.$textareaEl.blur();
        expect(view.$textareaEl.val()).to.equal(view._i18n.PLACEHOLDERTEXT);
    });

    it('should not reset non-empty field back to placeholder on blur in hack mode', function() {
        view._placeholderSupported = false;
        view.$textareaEl.val('abc');
        view.$textareaEl.blur();
        expect(view.$textareaEl.val()).to.equal('abc');
    });

    it('should not clear non-placeholder content on focus in hack mode', function() {
        view._placeholderSupported = false;
        view.$textareaEl.val('abc');
        view.$textareaEl.focus();
        expect(view.$textareaEl.val()).to.equal('abc');
    });

    it('should show errors', function () {
        view.showError('ERROR ERROR ERROR');
        expect(view.$('.lf-error-message').html()).to.equal('ERROR ERROR ERROR');
    });

    it('should support line breaks', function() {
        view.$textareaEl.val('abc\ndef');
        var content = view._getContents();
        expect(content).to.equal('<p>abc</p><p>def</p>');
        view.$textareaEl.val('abc\n\ndef');
        content = view._getContents();
        expect(content).to.equal('<p>abc</p><p></p><p>def</p>');
    });

    it('should not clear text on render', function () {
        view.$textareaEl.val('FOEVAR');
        view.render();
        expect(view.$textareaEl.val()).to.equal('FOEVAR');
    });

    describe('_resize', function() {
        it('updates the resize element with the textarea\'s content converted to html', function() {
            view.$textareaEl.val('abc\ndef');
            view._resize();
            expect(view.$resizeEl.html()).to.equal('<p>abc</p><p>def</p>');
        });
    });
});
