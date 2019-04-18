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

# Interfaces
statica.js comes with native support for interfaces (of some sort). You can define an interface in the following manner:
```js
let Person = new Interface({
  name: {
    type: "string"
  },
  sayName: {
    type: "function"
    value: function(){
      console.log("I'm " + this.name);
    }
  }
}, "Person");
```
The interface constructor takes an object as the parameters, where the keys are the fields. Each value is an object, where you can specify a type (not a statica type, a normal JS type: ```"number"```, ```"boolean"```, ```"string"```, ```"undefined"``` and ```"object"```), and a value, which is inserted if the field is not already present. The last parameter is the name of the interface (INCLUDE THIS PARAMETER - otherwise ```i:``` selectors will fail).
While classes don't implement interfaces, objects do. Example:
```js
let Person = new Interface({
  name: {
    type: "string"
  },
  sayName: {
    type: "function"
    value: function(){
      console.log("I'm " + this.name);
    }
  }
}, "Person");
let Joe = {
  name: "Joe"
}.implements(Person) // No error, Joe now has sayName function
let Sally = {}.implements(Person) // Error, sally has no name field.
```
You can select interfaces in the same manner you select classes, except the selector is ```i:```:
```js
let Joe = T.type({name:"Joe"}.implements(Person), "i:Person");
```

# Data Types
The langauge Haskell is an amazing and beautiful langauge that rivals Javascript. In Haskell, rather than ```enums```, you can declare a data type to store multiple values. Now, that functionality has arrived in Javascript:
```js
let Color = data({
  vals: ["Red", "Green", "Blue"],
  type: "Color"
});
let myCol = new Color("Red");
myCol.value = "Blue"; //Good
myCol.value = "Yellow"; //Error!
```
The data constructor is a metaclass which returns a class that you can use. The ```vals``` parameter represents the valid values of the data type, and the ```type``` parameter is for statica type checking (Like the interface ```name``` parameter, this MUST BE SPECIFIED)
To type check with data types, you can use the ```d:``` selector.
```js
let myCol = T.type(new Color("Red"), "d:Color");
```
Remeber, because ```T.type``` implements a wrapper, in order to access the value of a data type wrapped in a ```T.typewrapper```, you must type:
```js
MyDataType._.value;
```
# Type Operators
Let's say you wanted to make a type that could be a number or a string. By using the OR operator ```|```, this is possible:
```
let numorstr = T.type(3, "Number|String");
numorstr._ = "Hello"; //No error
numorstr._ = true; //Error
```
The OR operator can take an unlimited number of types (You can string them together). 
Next, you can use the AND operator to specifiy to types the value must fufill:
```js
class Foo {}
let Bar = new Interface({}, "Bar");
let foobar = T.type(new Foo().implements(Bar), "c:Foo&i:Bar");
```
Finally, the NOT operator can be placed at the beginning of the string to reverse the effect of the type.
```js
let nobool = T.type(3, "!Boolean");
nobool._ = "Hello"; //No Error
nobool._ = true; //Error
```
## Limitations
Type operators have certain limitations:
1. Not operators can only be placed once at the beginning of a type.
2. You can not include AND and OR operators in the same type.
3. Operators cannot be nested (no parentheses).

# Function Type Checking

## Typeifying Parameters
In order to implement function type checking, let's start with a typical function:
```js
function add(a, b){
  return a + b;
}
```
In order to implement type checking, let's start by checking that both parameters are numbers with the ```T.typeify``` function. Pass in the functions ```arguments``` array as the first argument, and then an array of the types you want for each parameter. The functions turns your parameters into typewrapped objects, like the ones created by ```T.type```, so you use ```yourvarnamehere._``` to access the parameters's values after the ```T.typeify``` call:
```js
function add(a, b){
  T.typeify(arguments, ["Number", "Number"]);
  return a._ + b._;
}
```
This inforces type checking on parameters. To do type checking on the return value, use ```T.returns```:
```js
function add(a, b){
  T.typeify(arguments, ["Number", "Number"]);
  return T.returns(a._ + b._, "Number");
}
```
## Function Headers
Now, this is all you need at a bare minimum. However, if you are going to use first-class functions, you must specify a *function header* to type check for those functions. Below are the functions that accomplish that:
```js
function add(a, b){
  T.typeify(arguments, ["Number", "Number"]);
  return T.returns(a._ + b._, "Number");
}.params("Number", "Number").returns("Number");
```
The ```params``` functions defines the type of the parameters (in order), while the ```returns``` function defines the return type. Then, you can type check with function headers like this (using the code from the previous example):
```js
function doMath(a, b, func){
  T.typeify(arguments, ["Number, "Number", {
    params: ["Number, "Number"]
    returns: "Number"
  });
  return T.returns(func._(a._, b._), "Number");
} //You don't need header annotation if you're not going to type check the function itself.
```
The function header is composed of an object, with the ```params``` key, and the ```returns``` key. The ```params``` key is a list of the types of the function's arguments, in order, while the ```returns``` key is the functions return type. Using the code from above, we can call the doMath function like this:
```js
doMath(3, 7, add) //Returns 10
```
## Generics
Where are the generics? ALL type-checking libraries have them. In statica, we have the ```T.generic``` function, that takes in a value and returns it's type. You can see it in action here:
```js
function id(val){
  T.typeify(arguments, T.generic(val));
  return T.returns(val, T.generic(val));
} //Function headers are not yet supported for generics.
```
However, because there is no way in native javascript to implement function generics in function headers, if you want to type check a generic function, use the ```Function``` type.

And that's statica!

# Features coming soon(er or later):
- AND, OR and NOT nesting - Which means you can use all three in the same type.
