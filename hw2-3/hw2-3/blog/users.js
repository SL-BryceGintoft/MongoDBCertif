var bcrypt = require('bcrypt-nodejs');

/* The UsersDAO must be constructed with a connected database object */
function UsersDAO(db) {
    "use strict";

    /* If this constructor is called without the "new" operator, "this" points
     * to the global object. Log a warning and call it correctly. */
    if (false === (this instanceof UsersDAO)) {
        console.log('Warning: UsersDAO constructor called without "new" operator');
        return new UsersDAO(db);
    }

    var users = db.collection("users");

    this.addUser = function(username, password, email, callback) {
        "use strict";

        // Generate password hash
        var salt = bcrypt.genSaltSync();
        var password_hash = bcrypt.hashSync(password, salt);

        // Create user document
        var user = {'_id': username, 'password': password_hash};

        // Add email if set
        if (email != "") {
            user['email'] = email;
        }
        
        // TODO: hw2.3
        //callback(Error("addUser Not Yet Implemented!"), null);
        // See if in database, return error 11000 if exists
        var usrQuery = {'_id': username};
        users.findOne(usrQuery, function(err, doc) {
            //if(err) throw err;
            if(err) callback(err, null);;
            if(doc != null){
            
                console.dir(doc);
                // throw the error
                var e = new Error("User Already Exists!");
                e.code = 11000;
                callback(e, null);
                db.close();
            }
            else{
                users.insert(user, function(err, inserted) {
                    if(err) throw err;

                    console.dir("Successfully inserted: " + JSON.stringify(inserted));

                    //return db.close();
                    // If not in database, add the record
                    callback(null, user);
                    //db.close();
            });

            //db.close();
            }
        });

        
    }

    this.validateLogin = function(username, password, callback) {
        "use strict";

        // Callback to pass to MongoDB that validates a user document
        function validateUserDoc(err, user) {
            "use strict";

            if (err) return callback(err, null);

            if (user) {
                if (bcrypt.compareSync(password, user.password)) {
                    callback(null, user);
                }
                else {
                    var invalid_password_error = new Error("Invalid password");
                    // Set an extra field so we can distinguish this from a db error
                    invalid_password_error.invalid_password = true;
                    callback(invalid_password_error, null);
                }
            }
            else {
                var no_such_user_error = new Error("User: " + user + " does not exist");
                // Set an extra field so we can distinguish this from a db error
                no_such_user_error.no_such_user = true;
                callback(no_such_user_error, null);
            }
        }

        // TODO: hw2.3
        //console.dir(user);
        //callback(Error("validateLogin Not Yet Implemented!"), null);
        //callback(null, user);
        
        // Create user document
        var userQuery = {'_id': username};
        users.findOne(userQuery, validateUserDoc );
        
    }
}

module.exports.UsersDAO = UsersDAO;
