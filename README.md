streamhub-editor
================

[![Build Status](https://travis-ci.org/Livefyre/streamhub-editor.png)](https://travis-ci.org/Livefyre/streamhub-editor)

Minimal editor for use with streamhub.

## Implementing a Subclass

The Editor is itself a subclass of [View](https://github.com/Livefyre/view).

The Editor defines a `_i18` property for its display strings that can either be overridden or extended.

The Editor has a few abstract methods:

```
@param {Object} data
#sendPostEvent
```
What to do with the comment data (dispatch a DOM event, invoke a service, etc.)

```
@param {Object} data
#_handlePostFailure = util.abstractMethod;
```

What to do on error.

```
@param {Object} data
#_handlePostSuccess = util.abstractMethod;
```

What to do on success.

