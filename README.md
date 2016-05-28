![Get this with Bower](https://camo.githubusercontent.com/06c5d22b7908c0c4928071ac314e75c3da29d750/687474703a2f2f62656e7363687761727a2e6769746875622e696f2f626f7765722d6261646765732f62616467654032782e706e67)

[![Build Status][travis-url]][travis-image] [![Coverage Status][coveralls-url]][coveralls-image] [![Dependency Status][depstat-image]][depstat-url] [![devDependency Status][depstat-dev-image]][depstat-dev-url] 
[![Code Climate][code-climate-url]][code-climate-image]
[![Inline docs](http://inch-ci.org/github/scaljeri/javascript-dependency-injection.svg?branch=master&style=flat-square)](http://inch-ci.org/github/scaljeri/javascript-dependency-injection)

[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/scaljeri/javascript-dependency-injection?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

Javascript Dependency Injection library (ES2015)

 DI makes classes accessible by a contract. Instances are created when requested and 
 dependencies are injected into the constructor, facilitating lazy initialization and 
 loose coupling between classes.
     
 As an example, consider a User and Persitance classes:
 
     class FileDB {
         constructor(fs, tableName, fistOfFields) { .... }
         
         persist(record) { .... }
     }
     
     class User {
         constructor(email, passwd, storage, role) { ... }
         
         save() { this.storage.persist(this); }
     }
 
 To define the relation between both classes use `DI#register`
 
    import fs from 'fs';
    
    var di = new DI();
    
    di.register('$user', User, [null, 'welcome', '$fileDb', 'nobody']);
    di.register('$fileDb', FileDb, [fs, 'user', ['email','passwd', 'role']], {singleton: true});
    
The 1st argument of `DI#register` is the name of the contract, the 2nd the class reference, the 3rd an array
of the constructor arguments and the last a config object. Currently ther config has only 2 options

    - singleton, it only create the instance once
    - notAClass, meaning that the reference is not a class
    
To get instances do
          
    di.getInstance('$user', 'test@di.com');
    
or if you also wish to change the role

    di.getInstance('$user', 'test@di.com', null, null, 'admin');

For more advanced use-cases checkout the [unit tests](https://github.com/scaljeri/javascript-dependency-injection/blob/master/test/di.spec.js).
[//]: # (Checkout more detailed the documentation [here](http://scaljeri.github.io/javascript-dependency-injection/classes/DI.html))

#### Installation ####

Install the dependencies as follows

    $> npm install --save javascript-dependency-injection@beta

[travis-url]: https://travis-ci.org/scaljeri/javascript-dependency-injection.png
[travis-image]: https://travis-ci.org/scaljeri/javascript-dependency-injection

[coveralls-url]: https://coveralls.io/repos/scaljeri/javascript-dependency-injection/badge.svg
[coveralls-image]: https://coveralls.io/r/scaljeri/javascript-dependency-injection

[depstat-url]: https://david-dm.org/scaljeri/javascript-dependency-injection
[depstat-image]: https://david-dm.org/scaljeri/javascript-dependency-injection.svg

[_depstat-dev-url]: https://david-dm.org/scaljeri/javascript-dependency-injection#info=devDependencies
[_depstat-dev-image]: https://david-dm.org/scaljeri/javascript-dependency-injection.svg#info=devDependencies

[depstat-dev-url]: https://david-dm.org/scaljeri/javascript-dependency-injection#info=devDependencies
[depstat-dev-image]: https://david-dm.org/scaljeri/javascript-dependency-injection/dev-status.svg

[code-climate-url]: https://codeclimate.com/github/scaljeri/javascript-dependency-injection/badges/gpa.svg
[code-climate-image]: https://codeclimate.com/github/scaljeri/javascript-dependency-injection
