![Get this with Bower](https://camo.githubusercontent.com/06c5d22b7908c0c4928071ac314e75c3da29d750/687474703a2f2f62656e7363687761727a2e6769746875622e696f2f626f7765722d6261646765732f62616467654032782e706e67)

[![Build Status][travis-url]][travis-image] [![Coverage Status][coveralls-url]][coveralls-image] [![Dependency Status][depstat-image]][depstat-url] [![devDependency Status][depstat-dev-image]][depstat-dev-url] 
[![Code Climate][code-climate-url]][code-climate-image]
[![Inline docs](http://inch-ci.org/github/scaljeri/javascript-dependency-injection.svg?branch=master&style=flat-square)](http://inch-ci.org/github/scaljeri/javascript-dependency-injection)

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/scaljeri/javascript-dependency-injection?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

## Javascript Dependency Injection library written in ES2015 

You can find a demo, documentation and a code coverage report [here](http://scaljeri.github.io/javascript-dependency-injection/)

 This dependency injection (**DI**) library makes classes accessible by a contract. Instances are created when requested and 
 dependencies are injected into the constructor, facilitating lazy initialization and 
 loose coupling between classes --> maintainable and testable code!!!!
 
### The Basics     

Consider the following situation in which the class `Bar` depends on `Foo`

     class Bar {
         constructor(val1, $foo, val2) { this.foo = $foo; this.val1 = val1; ... }
     }
     
     class Foo {}
     
These classes can be registered as follows

    di.register('$bar', Bar);                   // $bar - is the name of the contract (can be anything),
                                                // Bar  - the class reference
    di.register('$foo', Foo);                   // The order of registration is irrelevant (lazy initialization!)
    
Finally, use `getInstance` to create instances

    let bar = di.getInstance('$bar', 10, 20);   // bar instanceof Bar
                                                // bar.val1 === 10
                                                // bar.foo instanceOf Foo -> true
                                                // bar.val2 === 20
    
Note how `bar.foo` is an instance of `Foo` and not the value `20`!

If you like to be more explicit, you can define the constructor arguments yourself

    di.register('$bar', Bar, [undefined, '$foo', undefined]);
    
### Singletons
If you need a class to be a singleton, just tell **DI**
 
     di.register('$bar', Bar, { singleton: true });
     // di.getInstance('$bar') === di.getInstance('$bar')
     
### Factories
A class can produce instances of an other class
 
     class Bar {
         getFoo(input) {
             return new Foo(input);
         }
     }
     
In order to rewrite this using DI, Factories come to the rescue 

     class Bar {
         constructor(fooFactory) { this.fooFactory = fooFactory; }
          
         getFoo(input) { 
            return this.fooFactory(input);  
         }
     }
     
and the relations are now defined as follows
 
     di.register('$bar', Bar, ['$fooFactory']);
     
     di.register('$foo', Foo);
     
That's all, the Foo-factory is created auto magically!
 
If you really want to create a factory yourself, you can
     
     di.register('$fooFactory', ['list', 'of', 'params'], { factoryFor: '$bar' });
     
## Parameters 
Now things get a bit tricky, because parameters can be set at different places and
some kind of parameter-inheritance happens. For example
 
     di.register('$bar', Bar, ['p1', 'p2', 'p3', 'p4']);
     let bar = di.getInstance('$bar', 'p5', 'p6', 'p7');
     
The `getInstance` method accepts constructor arguments too. The above is equivalent o
    
      new Bar('p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7');
      
The parameters are added. But what if you like to replace the initial parameter?
  
     di.register('$bar', Bar, ['p1', 'p2', 'p3', 'p4'], { writable: true });
     let bar = di.getInstance('$bar', 'p5', 'p6', 'p7');
 
This time the constructor arguments are
 
     'p5', 'p6', 'p7', 'p4'
     
Important to note here is that an initial parameter is only replaced if the 
new parameter not equals `undefined`. 
  
With factories, you have this behavior too, but also an extra inheritance layer. 
Check this out

    di.register('$barFactory', ['p1', 'p2', 'p3', 'p4', 'p5'], { factoryFor: '$bar' });    
    let barFactory = di.getInstance('$barFactory', 'p6', 'p7');                            
    let bar = barFactory('p8', 'p9');  // bar is initialized with 'p1', 'p2', ...., 'p9'   
    
For more advanced use-cases checkout the [unit tests](https://github.com/scaljeri/javascript-dependency-injection/blob/master/test/di.spec.js)
file.

#### Installation ####

Install this library with `npm` 

    $> npm install --save javascript-dependency-injection@beta
    
or

    $> bower install javascript-dependency-injection#2.0.0-rc.1
    
#### Unit testing ####

    $> npm test
    
#### Documentation ####

    $> npm run doc

[travis-url]: https://travis-ci.org/scaljeri/javascript-dependency-injection.png
[travis-image]: https://travis-ci.org/scaljeri/javascript-dependency-injection

[coveralls-image]: https://coveralls.io/github/scaljeri/javascript-dependency-injection?branch=master
[coveralls-url]: https://coveralls.io/repos/github/scaljeri/javascript-dependency-injection/badge.svg?branch=master

[depstat-url]: https://david-dm.org/scaljeri/javascript-dependency-injection
[depstat-image]: https://david-dm.org/scaljeri/javascript-dependency-injection.svg

[_depstat-dev-url]: https://david-dm.org/scaljeri/javascript-dependency-injection#info=devDependencies
[_depstat-dev-image]: https://david-dm.org/scaljeri/javascript-dependency-injection.svg#info=devDependencies

[depstat-dev-url]: https://david-dm.org/scaljeri/javascript-dependency-injection#info=devDependencies
[depstat-dev-image]: https://david-dm.org/scaljeri/javascript-dependency-injection/dev-status.svg

[code-climate-url]: https://codeclimate.com/github/scaljeri/javascript-dependency-injection/badges/gpa.svg
[code-climate-image]: https://codeclimate.com/github/scaljeri/javascript-dependency-injection
