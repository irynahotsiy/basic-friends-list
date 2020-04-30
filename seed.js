const connection = require("./dbconnection");

connection.connect();

const sql = `
DROP TABLE IF EXISTS relations;
DROP TABLE IF EXISTS users;


CREATE TABLE users (
  id int NOT NULL AUTO_INCREMENT,
  full_name varchar(255) NOT NULL,
  email varchar(255) NOT NULL,
  passwordhash varchar(255) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY users_emailUN (email)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;



CREATE TABLE relations (
  user_from int NOT NULL,
  user_to int NOT NULL,
  status int NOT NULL,
  PRIMARY KEY (user_from,user_to),
  KEY relations_FK_1 (user_to),
  CONSTRAINT relations_FK FOREIGN KEY (user_from) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT relations_FK_1 FOREIGN KEY (user_to) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


INSERT INTO users(
  id,
  full_name,
  email, 
  passwordhash)
VALUES(1, "test1", "test1@gmail.com", md5("test1")),
      (2, "test2", "test2@gmail.com", md5("test2")),
      (3, "test3", "test3@gmail.com", md5("test3")),
      (4, "test4", "test4@gmail.com", md5("test4"));


INSERT INTO relations(
  user_from,
  user_to, 
  status)
VALUES(1, 2, 1),
      (2, 1, 1),
      (3, 1, 0),
      (3, 2, 2),
      (4, 3, 1);
;`;

connection.query(sql, (err, base) => {
  if (err) {
    console.log(err);
  } else {
    console.log("success");
  }
  connection.end();
});
