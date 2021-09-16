CREATE TABLE `diagnosis_evolution` (
  `DxEvolutionID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `Name` varchar(255) DEFAULT NULL,
  `ProjectID` int(10) unsigned DEFAULT NULL,
  `visitLabel` varchar(255) DEFAULT NULL,
  `instrumentName` varchar(255) DEFAULT NULL,
  `sourceField` varchar(255) DEFAULT NULL,
  `orderNumber` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`DxEvolutionID`),
  CONSTRAINT `FK_DxEvolution_1` FOREIGN KEY (`ProjectID`) REFERENCES `Project` (`ProjectID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- TODO: Remove this and replace with a dx_cand_rel table
-- TODO: Update schema
ALTER TABLE `candidate`
  ADD COLUMN `LatestDiagnosis` text DEFAULT NULL,
  ADD COLUMN `SourcedFromDxEvolutionID` int(10) unsigned DEFAULT NULL,
  ADD CONSTRAINT `FK_DxEvolutionID` FOREIGN KEY (`SourcedFromDxEvolutionID`) REFERENCES `diagnosis_evolution` (`DxEvolutionID`)
;