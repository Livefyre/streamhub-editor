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
});
