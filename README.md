Javascript Depenendy Injection library [![Build Status](https://travis-ci.org/scaljeri/javascript-dependency-injection.png)](https://travis-ci.org/scaljeri/javascript-dependency-injection)

 DI makes classes accessible by a contract. Instances are created when requested and 
 dependencies are injected into the constructor, facilitating lazy initialization and 
 loose coupling between classes.
     
 As an example, consider a User and Persitance classes:
 
     function WebSql(name, fieldList)  { ... }        // Persist data using WebSQL
     function IndexDB(name, fieldList) { ... }        // Persist data using IndexDB
 
     function User(email, passwd, rold, storage) {    // the `storage` parameter holds an instance
         this.id = uniqueId;                          // from `WebSql` or `IndexDB`
         this.save = function (log) {
             storage.persist(this.id, log);
         };
     }
     
 With these classes available the following contracts can be defined:
 
     var di = new DI();
     di.register('user', User, [null, 'welcome', 'websql', 'nobody']);                    
     di.register('websql', WebSql, ['user', [ .. list of fields ..]], {singleton: true});
     di.register('indexdb', IndexDB, ['user', [ .. list of fields ..]], {singleton: true});
     
Now by default `User` uses the `WebSql` class to persist its user data

    var user1 = di.getInstance('user', ['john@exampe.com']),
        user2 = di.getInstance('user', ['john@exampe.com', 'newSecret']); // define a new password
    
But it is also possible to use the other persistant class:

    var user = di.getInstance('user', ['john@exampe.com', null, 'indexdb']),
        root = di.getInstance('user', ['john@exampe.com', 'newSecret', 'indexdb', 'admin']); 
     
#### Gulp tasks ####

Install the dependencies as follows

    $> npm install

To minify the library

    $> gulp
    
To run the tests

    $> gulp test

#### Installation ####

    $> bower install javascript-dependency-injection