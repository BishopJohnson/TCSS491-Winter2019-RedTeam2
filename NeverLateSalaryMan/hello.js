// weak typing
var int = 42;
var double = Math.PI;
var char = 'A';
var string = "Hello World";

// the only other types are functions, objects and arrays
// we use console.log() to output to the console

var array = [];
var object = {};
function printIt(parameter) {
    console.log(parameter);
};

// toString is automatic in JavaScript

console.log("Weak Types");
console.log("Int " + int);
console.log("Double " + double);
console.log("Char " + char);
console.log("String " + string);
console.log("\n");

console.log("Function");
console.log(console.log);

//  arrays use push instead of add and can take any type

array.push(int);
array.push(double);
array.push(char);
array.push(string);

console.log("\n");
console.log("Arrays");
console.log(array);

// arrays act as maps and can be added to in strange ways

array[42] = 42;
array["field"] = "value";
array.x = "The Spot";
console.log(array);

// array can be defined on the fly 

console.log([1, 2, 3, 4, 5]);

// simple objects are like arrays

object.field = "value";
object.x = "The Spot";
object.int = 42;
object.double = Math.PI;
object.array = array;
object[10] = 10;
object.function = printIt; // note this is not the proper way to attach a function
console.log(object);
console.log({message: "This object is defined on the fly.", property: "It has two properties."});

// in JavaScript a class is really a function

function Person(name, age) {
    // we use this to refer to the current object
    this.name = name;
    this.age = age;

    // local variables are still declared with var
    var int = 1337;
    console.log("Local Variable ");
    console.log(int);
}

// we can attach other functions to this class using the functions prototype

Person.prototype.getOlder = function () {
    this.age++;
};

// we use new to create new instances of the object
var alice = new Person("Alice", 33);
var bob = new Person("Bob", 43)
alice.getOlder();
console.log(alice);
console.log(bob);


// advanced JavaScript
// JavaScript is asynchronous
    // window is the top object
    // setTimeout delays a function call
// functions can be declared inline even as arguments
// functions can be passed as arguments to other functions

window.setTimeout(function () {
    console.log("One Second Delay");
}, 1000);

window.setTimeout(function () {
    console.log("One Millisecond Delay");
}, 1);
