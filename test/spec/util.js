var util = require('streamhub-editor/util');
var expect = require('chai').expect;

describe('streamhub-editor/util', function() {
    describe('abstractMethod', function() {
        var cls = function(){};
        cls.prototype.test = util.abstractMethod;
        var testFn;

        beforeEach(function() {
            testFn = new cls();
        });

        it('should throw an exception', function() {
            expect(testFn.test).to.throw.exception;
        });

        it('should not throw an exception when overridden', function() {
            testFn.test = function() {
                return 'abc';
            };
            expect(testFn.test).to.not.throw.exception;
            expect(testFn.test()).to.equal('abc');
        });
    });

    describe('normalizeNewlines', function () {
        it('wraps contents in paragraph elements', function () {
            expect(util.normalizeNewlines('abc')).to.equal('<p>abc</p>');
        });

        it('adds additional paragraphs for each newline', function () {
            var result = util.normalizeNewlines('abc\ndef');
            expect(result).to.equal('<p>abc</p><p>def</p>');
        });

        it('strips superfluous newlines at the end of the content', function () {
            var result = util.normalizeNewlines('abc\ndef\n\n\n\n');
            expect(result).to.equal('<p>abc</p><p>def</p>');
        });

        it('does not strip superfluous newlines between content', function () {
            var result = util.normalizeNewlines('abc\n\n\n\ndef');
            var expected = '<p>abc</p><p></p><p></p><p></p><p>def</p>';
            expect(result).to.equal(expected);
        });
    });
});
