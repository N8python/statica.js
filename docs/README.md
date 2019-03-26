# statica.js
Typescript and Flow are great. But they can't actually run natively in the browser. This means you have to deal with config files, compiliers, and even worse: No runtime benefits! You don't actually get static typing at runtime. statica.js is the solution to that. It is a native implementation of static typing for JS, and is cross-browser, working in all browsers (even IE). 

# Getting Started
To get started, including the following ```<script>``` tag in the head of your html page:
```html
<script src="https://cdn.jsdelivr.net/gh/N8python/statica.js@0.0.1/dist/statica.min.js"></script>
```
Currently, statica is only available on the client side.

# Making your first variable
Let's get started, and make a statica variable:
```js
let num = T.type(3, "Number");
```
Okay - what's going on here?
We utilize the ```T.type``` function, passing in a value, and then a type. However, because javascript dosen't have operator overloading, ```T.type``` returns a wrapper, so we access the value of num like this:
```js
num._; //3
num._ = 4; //num is now 4
```
However, if we try this:
```js
num._ = "Hello Error"; //Throws an error
```
While you may be tempted to access the value of ```num```, or try to set the variable ```num``` itself, doing so will destroy the wrapper object, and you will lose type-checking. So, avoid:
```js
num; //Returns T.typewrapper
num = 4; //num is now 4 - but the typewrapper object has been garbage collected, and we lose type checking!
```
So, now that we know how to make and use variables, what different types are there?

# Basic Types
