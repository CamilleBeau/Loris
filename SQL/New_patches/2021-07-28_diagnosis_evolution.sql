CREATE TABLE `diagnosis_evolution` (
  `DxEvolutionID` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `Name` varchar(255) DEFAULT NULL,
  `ProjectID` int(10) unsigned DEFAULT NULL,
  `visitLabel` varchar(255) DEFAULT NULL,
  `instrumentName` varchar(255) DEFAULT NULL,
  `sourceField` varchar(255) DEFAULT NULL,
  `orderNumber` int(10) unsigned DEFAULT NULL,
  PRIMARY KEY (`DxEvolutionID`),
  UNIQUE KEY `TrajectoryName` (`Name`),
  CONSTRAINT `FK_DxEvolution_1` FOREIGN KEY (`ProjectID`) REFERENCES `Project` (`ProjectID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `candidate_diagnosis_evolution_rel` (
  `CandID` int(6) NOT NULL,
  `DxEvolutionID` int(10) unsigned NOT NULL,
  `Diagnosis` text DEFAULT NULL,
  `Confirmed` enum('Y', 'N') DEFAULT NULL,
  `LastUpdate` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`CandID`, `DxEvolutionID`),
  UNIQUE KEY `candidateDxEvolution` (`CandID`, `DxEvolutionID`),
  CONSTRAINT `FK_candidateDxEvolution_1` FOREIGN KEY (`CandID`) REFERENCES `candidate` (`CandID`),
  CONSTRAINT `FK_candidateDxEvolution_2` FOREIGN KEY (`DxEvolutionID`) REFERENCES `diagnosis_evolution` (`DxEvolutionID`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;