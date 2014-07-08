var $ = require('jquery');
var expect = require('chai').expect;
chai.use(require('sinon-chai'));
var sinon = require('sinon');
var Auth = require('auth');
var AuthEditor = require('streamhub-editor/auth-editor');
var Content = require('streamhub-sdk/content');
var Collection = require('streamhub-sdk/collection');
var MockUserFactory = require('livefyre-auth-tests/mocks/mock-user-factory');

describe('streamhub-editor/auth-editor', function () {

    var content,
        mockUserFactory,
        user;

    beforeEach(function () {
        content = new Content({ body: 'hi' });
        mockUserFactory = new MockUserFactory();
        user = mockUserFactory.createUser();

        Auth.delegate({
            login: function () {},
            logout: function (loggedOut) {
                loggedOut();
            }
        });
    });

    it('handles a user logging in', function () {
        var editor = new AuthEditor({
            collection: new Collection()
        });

        var loginSpy = sinon.spy(editor, 'handleLogin');

        // login
        Auth.login({ livefyre: user});

        assert(loginSpy.called);
    });

    it('handles a user logging out', function () {
        var editor = new AuthEditor({
            collection: new Collection()
        });

        // login
        Auth.login({ livefyre: user});

        var logoutSpy = sinon.spy(editor, 'handleLogout');

        // logout
        Auth.logout();

        assert(logoutSpy.called);
    });

    describe('when user has not yet authenticated/logged in', function () {
        var editor,
            collection;

        beforeEach(function () {
            Auth.logout();

            collection = new Collection();
            editor = new AuthEditor({
                collection: collection
            });
            editor.render();
        });

        describe('and user submits post via post button', function () {
            it('Auth delegate invoked', function () {
                var authLoginSpy = sinon.spy(Auth, 'login');
                var authCmdSpy = sinon.spy(editor._authCmd, 'execute');

                editor.$el.find('.lf-editor-field').val('my post');
                editor.$el.find('.lf-editor-post-btn').trigger('click');

                assert(authCmdSpy.called);
                assert(authLoginSpy.called);

                editor._authCmd.execute.restore();
                Auth.login.restore();
            });

            it('Does not write to writeable (collection)', function () {
                collection.write = function () {}; // stub-out write method
                var collectionWriteSpy = sinon.spy(collection, 'write');

                editor.$el.find('.lf-editor-field').val('my post');
                editor.$el.find('.lf-editor-post-btn').trigger('click');

                assert(! collectionWriteSpy.called);
            });
        });

        describe('and user submits post via enter keypress', function () {
            it('Auth delegate invoked', function () {
                var authLoginSpy = sinon.spy(Auth, 'login');
                var authCmdSpy = sinon.spy(editor._authCmd, 'execute');

                var editorTextEl = editor.$el.find('.lf-editor-field');
                editorTextEl.val('my post');

                var e = $.Event("keydown");
                e.which = e.keyCode = 13; // # Enter key code
                $(editorTextEl).trigger(e);

                assert(authCmdSpy.called);
                assert(authLoginSpy.called);

                editor._authCmd.execute.restore();
                Auth.login.restore();
            });

            it('Does not write to writeable (collection)', function () {
                collection.write = function () {}; // stub-out write method
                var collectionWriteSpy = sinon.spy(collection, 'write');

                var editorTextEl = editor.$el.find('.lf-editor-field');
                editorTextEl.val('my post');

                var e = $.Event("keydown");
                e.which = e.keyCode = 13; // # Enter key code
                $(editorTextEl).trigger(e);

                assert(! collectionWriteSpy.called);
            });
        });
    });

    describe('when user has authenticated/logged in', function () {
        var editor,
            collection;

        beforeEach(function () {
            Auth.login({ livefyre: user});

            collection = new Collection();
            editor = new AuthEditor({
                collection: collection
            });
            editor.render();
        });

        it('Writes to writeable (collection) on enter keypress', function () {
            collection.write = function () {}; // stub-out write method
            var collectionWriteSpy = sinon.spy(collection, 'write');
            editor.$el.find('.lf-editor-field').val('my post');
            editor.$el.find('.lf-editor-post-btn').trigger('click');
            assert(collectionWriteSpy.called);
        });
    });
});
