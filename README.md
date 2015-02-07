![Get this with Bower](https://camo.githubusercontent.com/06c5d22b7908c0c4928071ac314e75c3da29d750/687474703a2f2f62656e7363687761727a2e6769746875622e696f2f626f7765722d6261646765732f62616467654032782e706e67)

[![Build Status][travis-url]][travis-image] [![Coverage Status][coveralls-url]][coveralls-image] [![Dependency Status][depstat-image]][depstat-url] [![devDependency Status][depstat-dev-image]][depstat-dev-url] 
[![Code Climate][code-climate-url]][code-climate-image]

Javascript Dependency Injection library

 DI makes classes accessible by a contract. Instances are created when requested and 
 dependencies are injected into the constructor, facilitating lazy initialization and 
 loose coupling between classes.
     
 As an example, consider a User and Persitance classes:
 
    function WebSql(name, fieldList)  {
        this.persist = function (obj) {
            console.log('WebSQL will persist:');
            fieldList.forEach(function (field) {
                console.log('    ' + field + ': ' + obj[field]);
            });
        }
    }

    function IndexDB(name, fieldList)  {
        this.persist = function (obj) {
            console.log('IndexDB will persist:');
            fieldList.forEach(function (field) {
                console.log('    ' + field + ': ' + obj[field]);
            });
        }
    }

    function User(email, passwd, storage, role) {    // the `storoge` parameter holds an instance
        this.email = email;
        this.passwd = passwd;
        this.role = role;

        this.save = function () {
            storage.persist(this);
        };
    }

 With these classes in our pocket its time to setup the relations between them. The function that does this has the 
 following signature
 
     function (<contract name>, 
               <class reference>, 
               [optional list of constructor arguments], 
               {optional configuration object} ) 
               
 Or just in code:
 
    var di = new DI();
    
    di.register('user', User, [null, 'welcome', 'websql', 'nobody']);
    di.register('websql', WebSql, ['userTable', ['email','passwd', 'role']], {singleton: true});
    di.register('indexdb', IndexDB, ['userTable', ['email','passwd', 'role']], {singleton: true});
          
Note that the provied constructor arguments are default values or contract names. From now it is easy to create 
instances:

    var user1 = di.getInstance('user', ['john@exampe.com']),
            -> email: 'john@exampe.com', passwd: 'welcome', storage : WebSQL instance, role: 'nobody'
        user2 = di.getInstance('user', ['john@exampe.com', 'newSecret']); // define a new password
            -> email: 'john@exampe.com', passwd: 'newSecret', storage : WebSQL instance, role: 'nobody'
            
    if (user1 instanceof User) { /* user1 is an instance of User!! */ }
    
But it is also possible to use `IndexDB` as the persistance class:

    var user = di.getInstance('user', ['john@exampe.com', null, 'indexdb']),               // The password is set to null too!
            -> email: 'john@exampe.com', passwd: null, storage : IndexDB instance, role: 'nobody'
        root = di.getInstance('user', ['john@exampe.com', undefined, 'indexdb', 'admin']); 
            -> email: 'john@exampe.com', passwd: 'welcome', storage : IndexDB instance, role: 'admin'
            
Checkout more detailed the documentation [here](http://scaljeri.github.io/javascript-dependency-injection/classes/DI.html)

#### Gulp tasks ####

Install the dependencies as follows

    $> npm install

To minify the library

    $> gulp
    
To run the tests

    $> gulp test

#### Installation ####

    $> bower install javascript-dependency-injection

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
