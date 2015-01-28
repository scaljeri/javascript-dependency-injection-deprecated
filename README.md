Javascript Depenendy Injection library [![Build Status](https://travis-ci.org/scaljeri/javascript-dependency-injection.png)](https://travis-ci.org/scaljeri/javascript-dependency-injection)

 DI makes classes accessible by a contract. Instances are created when requested and 
 dependencies are injected into the constructor, facilitating lazy initialization and 
 loose coupling between classes.
     
 As an example, register all contracts during the application initialization
     
     var di = new DI() ;
     di.register( 'UserModel'                                                                     // contract name
             , data.ActiveRecord                                                                  // class definiton
             , [ 'User', 'webSql', ['userNameField', 'passwordField', 'accountInfo'], 'websql' ]  // constructor parameters
             , { singleton: TRUE }                                                                // configuration: create a singleton
         )
         .register( 'userNameField'
             , data.Field
             , [{ type: 'TEXT',  key: 'username', friendlyName: 'User name' }]
             , {singleton: TRUE}
         )
         .register( 'accountInfoField',
             , data.Field
             ,   [ { type: 'TEXT',  key: 'username', friendlyName: 'User name' }
                     , ['encryptFilter', 'compressFilter']
                 ]
             , { singleton: TRUE}
         )
         .register( 'userRecord'
             , di.getInstance('UserModel')  // create the User model!!
         )
         ...
     
Now everywhere in the application create the instances as follows
     
    var User = di.getInstance('User') ;
    userRecord = new User({ username: 'John', password: 'Secret' }) ;
    // or
    userRecord = di.getInstance('userRecord', [{username: 'John', password: 'Secret'}]) ;
     
To give an idea of what this does, below is an example doing the exact same thing but without DI
     
    var userNameField    = new data.Field( { type: 'TEXT',  key: 'username', friendlyName: 'User name' }] ) ;
    var accountInfoField = new data.Field( { type: 'TEXT',  key: 'username', friendlyName: 'User name' }
                                                        , [encryptFilterInstance, compressFilterInstance] ) ;
    ...
     
And create instances like
     
    var User = new data.ActiveRecord( 'User', webSqlInstance, [userNameField, passwordField, accountInfoField] ) ;
    var userRecord = new User({username: 'John', password: 'Secret'}) ;

#### Gulp tasks ####

Install the dependencies as follows

    $> npm install

To minify the library

    $> gulp
    
To run the tests

    $> gulp test

#### Installation ####

    $> bower install javascript-dependency-injection