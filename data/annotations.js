const mysql = require('mysql');
// create connection to database
// the mysql.createConnection function takes in a configuration object which contains host, user, password and the database name.
const db = mysql.createConnection ({
	host: 'localhost',
    user: 'root',
    password: '',
    database: 'master_thesis',
    timezone: 'utc'
});

// connect to database
db.connect((err) => {
    if (err) {
        console.log("CANT CONNECT TO THE DATABASE");
    } else {
        console.log('Connected to database');
    }
});

exports.getAnnotations = async function(dataset) {
    if (db.state === 'disconnected') {
        return;
    }

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
    if (db.state === 'disconnected') {
        return;
    }

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
    if (db.state === 'disconnected') {
        return;
    }

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
    if (db.state === 'disconnected') {
        return;
    }

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
    if (db.state === 'disconnected') {
        return;
    }

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
    if (db.state === 'disconnected') {
        return;
    }
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
    if (db.state === 'disconnected') {
        return;
    }
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
    if (db.state === 'disconnected') {
        return;
    }
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

exports.getSessions = async function(dataset) {
    if (db.state === 'disconnected') {
        return;
    }
    let promise = new Promise((resolve, reject) => {
        var query = "SELECT * FROM sessions ";
        var extra = [];
        if (dataset) {
            query += " WHERE dataset = ?";
            extra.push(dataset);
        }
        query += " ORDER BY sessionDate asc";

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

exports.deleteSession = async function(id) {
    if (db.state === 'disconnected') {
        return;
    }
    let promise = new Promise((resolve, reject) => {
        db.query(
            "DELETE FROM sessions WHERE id = ?",
            [id],
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

exports.createSession = async function(body) {
    if (db.state === 'disconnected') {
        return;
    }
    console.log(body)
    let promise = new Promise((resolve, reject) => {
        db.query(
			"INSERT INTO sessions (dataset, sessionDate) VALUES (?,?)",
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

exports.updateSession = async function(id, date) {
    if (db.state === 'disconnected') {
        return;
    }
    let promise = new Promise((resolve, reject) => {
        db.query(
            "UPDATE sessions SET sessionDate = ? WHERE id = ?",
            [date, id],
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
