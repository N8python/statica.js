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

Statica uses built-in JS types to determine typing. Below are all the possible "basic types" that you can use in statica:
```js
let num = T.type(1, "Number"); //Number Type
let str = T.type("Hello statica", "String"); //String Type
let bool = T.type(true, "Boolean"); //Boolean Type
let arr = T.type([], "Array"); //Array Type (No generics)
let obj = T.type({}, "Object"); //Object Type (No generics)
let date = T.type(new Date(), "Date"); //Date Type
let regexp = T.type(/foobar/, "RegExp"); //Regex Type
let func = T.type(function(){}, "Function"); //More on functions later
let NULL = T.type(null, "Null"); //Null Type
let UNDEFINED = T.type(undefined, "Undefined"); //Undefined Type
```
## Optional Types
These are great types on their own. However, we can use *suffixes* to "beef them up". Ending any type with a ```?``` makes that type ```optional```. This means that type can be the actual type, null, or undefined:
```js
let opNum = T.type(3, "Number?");
opNum._ = undefined; //Okay
opNum._ = null; ///Okay
opNum._ = 5.545; //Okay
opNum._ = "Hello"; //Error
```
## Other Suffixes
The other suffixes in statica are ```#``` and ```@```. When you add ```#``` to the end of a ```Number``` type, that number can only be an integer.
```js
let int = T.type(3, "Number#");
int._ = 3.4 //Error
```
If the ```@``` is attached at the end of a ```String``` type, that string can only be a char:
```js
let char = T.type("h", "String@");
char._ = "Hello"; //Error
```
## Class Selectors 
However, there is a severe limitation in these basic types. All classes you create have the type of ```Object```. In order to specify that you want to check for classes, you need to use the class selector, or ```c:``` (Selectors can have the ```?``` suffix):
```js
class Foo {}
let foo = T.type(new Foo(), "c:Foo");
foo._ = {} //Error
let foo2 = T.type(new Foo(), "Object");
foo._ = {} //No Error
```

## Extension Selector
The extension selector (```e:```), functions in the same way that the class selector does, except that it reaches back into the prototype chain and matches the class the object inherits:
```js
class Foo {}
class Bar extends Foo {}
let bar = T.type(new Bar(), "e:Foo");
bar._ = new Foo() //Error
```
