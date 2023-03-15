# Changelog

## 1.6.0 - 2023-03-15

### Changed

- Expose SingleChoiceOptionTypes.dateInput to be generate option component for single choice questions
- add the possibility to specify study rules for the event `LEAVE` which is triggered, e.g., when the user deletes the account or a single profile.
- in study rules, where external services are referenced, an optional route can be specified

## 1.5.0 - 2023-02-08

### Added

- new study engine expression for `parseValueAsNum`

## 1.4.1 - 2023-01-31

### Changed

- expressionGenerator additional check to ensure argument is of type "Expression"

## 1.4.0 - 2023-01-27

### Changed

- additional option for survey availability
- PR2: more interfaces exposed

## 1.3.0 - 2022-10-21

### BREAKING CHANGES

- updated survey model from survey-engine related to improvements, how survey versions are represented.
- change how survey export files are generated, in pair with related updates for the python-tools

## 1.2.2

### Changed

- Fix issue for generating custom validations in responsive matrix

## 1.2.1

### Added

- Generator for new question type: "responsive matrix".
