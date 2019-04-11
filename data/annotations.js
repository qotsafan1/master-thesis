const mysql = require('mysql');
// create connection to database
// the mysql.createConnection function takes in a configuration object which contains host, user, password and the database name.
const db = mysql.createConnection ({
	host: 'localhost',
    user: 'root',
    password: '',
    database: 'master_thesis'
});

// connect to database
db.connect((err) => {
    if (err) {
		throw err;
    }
    console.log('Connected to database');
});

exports.getAnnotations = async function(dataset) {
    let promise = new Promise((resolve, reject) => {
        var query = "SELECT * FROM annotations ";
        var extra = [];
        if (dataset) {
            query += " WHERE dataset = ?";
            extra.push(dataset);
        }

        db.query(
            query, 
            extra,
            function (error, result) {
                if (error) {
                    console.log(error)
                    resolve("");
                } else {
                    resolve(result);
                }
            }
        );
    });

    return await promise;
}

exports.getAnnotation = async function(id) {
    let promise = new Promise((resolve, reject) => {
        db.query(
            "SELECT * FROM annotations WHERE id = ?",
            [id],
            function(error, result) { 
                if (error) {
                    console.log(error)
                    resolve(error);
                } else {
                    if (!(result.length > 0)) {
                        resolve("");
                    } else {
                        resolve(result);
                    }
                }
            }
        );    
    });

    return await promise;
}

exports.addAnnotation = async function(body) {
    let promise = new Promise((resolve, reject) => {
        db.query(
			"INSERT INTO annotations (dataset, type, comment, creationDate, systemName) VALUES (?,?,?,?,?)",
			body,
			function(error, result) { 
				if (error) {
                    console.log(error)
					resolve("");
				} else {
					resolve(result.insertId);
				}
			}
        );    
    });
    
    return await promise;
}

exports.deleteAnnotation = async function(id) {
    let promise = new Promise((resolve, reject) => {
        db.query(
            "DELETE FROM annotations WHERE id = ?",
            [id],
            function(error, result) { 
                if (error) {
                    console.log(error)
                    resolve(error);
                } else {				
                    resolve("");
                }
            }
        );
    });

    return await promise;
}

exports.invalidateObservation = async function(body) {
    let promise = new Promise((resolve, reject) => {
        db.query(
			"INSERT INTO observations (dataset, type, comment, creationDate, systemName) VALUES (?,?,?,?,?)",
			body,
			function(error, result) { 
				if (error) {
                    console.log(error)
					resolve("");
				} else {
					resolve(result.insertId);
				}
			}
        );    
    });
    
    return await promise;
}

exports.getObservation = async function(id) {
    let promise = new Promise((resolve, reject) => {
        db.query(
            "SELECT * FROM observations WHERE id = ?",
            [id],
            function(error, result) { 
                if (error) {
                    console.log(error)
                    resolve(error);
                } else {
                    if (!(result.length > 0)) {
                        resolve("");
                    } else {
                        resolve(result);
                    }
                }
            }
        );    
    });

    return await promise;
}

exports.deleteObservation = async function(systemName) {
    let promise = new Promise((resolve, reject) => {
        db.query(
            "DELETE FROM observations WHERE systemName = ?",
            [systemName],
            function(error, result) { 
                if (error) {
                    console.log(error)
                    return resolve(error);
                } else {
                    return resolve("");
                }
            }
        );
    });

    return await promise;
}

exports.getObservations = async function(dataset) {
    let promise = new Promise((resolve, reject) => {
        var query = "SELECT * FROM observations ";
        var extra = [];
        if (dataset) {
            query += " WHERE dataset = ?";
            extra.push(dataset);
        }

        db.query(
            query, 
            extra,
            function (error, result) {
                if (error) {
                    console.log(error)
                    resolve("");
                } else {
                    resolve(result);
                }
            }
        );
    });

    return await promise;
}
