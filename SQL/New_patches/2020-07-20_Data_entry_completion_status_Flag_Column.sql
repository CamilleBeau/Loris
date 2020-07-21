ALTER TABLE flag
    ADD COLUMN `Data_entry_completion_status` enum('Incomplete','Complete') NOT NULL default 'Incomplete';

UPDATE flag
    SET Data_entry_completion_status='Complete' WHERE
