/**
 * Database middleware
 *
 * @module middleware/database
 * @license Alexis Stella
 * @since 05.04.2022
 * @version 1.0.0
 */

// mysql package
const mysql = require('mysql');

let connection;

/**
 *  Function to connect to the database.
 *
 * @param host {string} - The host of the database.
 * @param user  {string} - The user of the database.
 * @param password {string} - The password of the database.
 * @param database {string} - The database name.
 * @returns {Promise<unknown>} - The connection to the database.
 */
const connectToDatabase = (host, user, password, database) => {
    return new Promise((resolve, reject) => {
        connection = mysql.createConnection({host, user, password, database});
        connection.connect((err) => {
            if (err) {
                reject(err);
            } else {
                resolve(connection);
            }
        });
    });
}
// export modules
module.exports.connection = connection;
module.exports.connectToDatabase = connectToDatabase;