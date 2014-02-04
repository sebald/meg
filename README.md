# meg.js

*meg.js* is a parsing expression parser for HTML and Markdown. It is based on the insanely great [peg.js](http://pegjs.majda.cz/) by [David Majda](http://majda.cz/) ([@dmajda](http://twitter.com/dmajda)).

**Note:** While the transformatiom from Markdown to HTML is lossless, parsing HTML to Markdown is not. *meg.js* is designed to be used to help save `contenteditable` elements with a (hopefully) more universal format.

## Gettings Started

You have to install [node.js](http://nodejs.org/) if you haven't already.

After you have setup node run `npm install`. When all packages have been installed you can run:

- `grunt` or `grunt release` to build the project (minified)
- `grunt test` to run the test suite (via [Karma](http://karma-runner.github.io/)).
- `grunt dev` will build the project unminified.
- `grunt tdd` if you want to write new tests and work on the project.

## Grammar

For reference here is the grammar used to transform HTML to Markdown:

```
Char <- /[^<]/
LowerCase <- /[a-z]/
TagName <- LowerCase+
TextNode <- Char*
StartTag <- '<' TagName '>'
ClosingTag <- '</' TagName '>'
Element <- StartTag Content ClosingTag
Content <- Element / TextNode
```

while `Content` is the only starting expression. `Char` and `LowerCase` are terminal symbols.


## Example Usage

```javascript
var parser = meg(),
    result = parser.fromHTML('<div>This is an <em>example</em>!</div>');

    // result is "This is an *example*!"
```

You can also pass additional mutation rules to *meg.js*:

```javascript
var parser = meg({ exp: /^sup$/, start: '^', end: '' }),
    result = parser.fromHTML('I am n<sup>2</sup>.');

    // result is "i am n²."
```

**Warning:** This feature is experimental, because it is not tested! For more informations see the [tests](/test/unit/).
