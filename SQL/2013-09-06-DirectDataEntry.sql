CREATE TABLE participant_accounts(
    ID integer unsigned not null auto_increment PRIMARY KEY,
    SessionID int(6),
    Test_name varchar(255),
    Email varchar(255),
    Complete enum('Yes', 'No'),
    OneTimePassword varchar(8) 
);

CREATE TABLE participant_emails(
    Test_name varchar(255) NOT NULL PRIMARY KEY REFERENCES test_names(Test_name),
    DefaultEmail TEXT NULL
);

ALTER TABLE test_names ADD COLUMN IsDirectEntry BOOLEAN;
