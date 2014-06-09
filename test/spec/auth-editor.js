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

    it('throws when opts.content is not specified', function () {
        expect(function () {
            new AuthEditor();
        }).to.throw('AuthEditor expects opts.content');
    });

    it('throws when #_collection is undefined', function () {
        expect(function () {
            new AuthEditor({
                content: content
            });
        }).to.throw('AuthEditor expects opts.content.collection to be defined or opts.collection to be specified');
    });

    it('handles a user logging in', function () {
        content.collection = new Collection();
        var editor = new AuthEditor({
            content: content
        });

        var loginSpy = sinon.spy(editor, 'handleLogin');

        // login
        Auth.login({ livefyre: user});

        assert(loginSpy.called);
    });

    it('handles a user logging out', function () {
        content.collection = new Collection();
        var editor = new AuthEditor({
            content: content
        });

        // login
        Auth.login({ livefyre: user});

        var logoutSpy = sinon.spy(editor, 'handleLogout');

        // logout
        Auth.logout();

        assert(logoutSpy.called);
    });
});
