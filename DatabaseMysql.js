const mysql = require("mysql");

class DatabaseMysql {

    constructor (host, user, password, database) {
        this.pool = mysql.createPool({ multipleStatements: true, host: host, user: user, password: password, database: database });
        this.pool.on("connection", function (connection) {
            connection.query("SET time_zone='+00:00';");
        })
    }

    query (textQuery) {
        var pool = this.pool;
        return new Promise(function (resolve, reject) {
            pool.getConnection(function (err, connection) {
                try {
                    if (connection) {
                        connection.query(textQuery, function (err, result) {
                            connection.release();
                            if (err) {
                                console.log(err);
                                reject(err);
                            } else {
                                resolve(result);
                            }
                        });
                    } else {
                        console.log(err);
                        reject(err);
                    }
                } catch (err) {
                    console.log(err);
                    reject(err);
                }
            });
        });
    }

}

module.exports = DatabaseMysql;
