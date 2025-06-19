const fs = require('fs');
const path = require('path');

// Read the current translation file
const translationPath = path.join(__dirname, 'frontend/src/i18n/translation.json');
const translations = JSON.parse(fs.readFileSync(translationPath, 'utf8'));

// Convert flat structure to nested structure with 'en' language code
const convertedTranslations = {};

Object.entries(translations).forEach(([key, value]) => {
  if (typeof value === 'string') {
    // Convert flat string to nested object with 'en' key
    convertedTranslations[key] = { en: value };
  } else {
    // Already in correct format, keep as is
    convertedTranslations[key] = value;
  }
});

// Write the converted translations back to the file
fs.writeFileSync(translationPath, JSON.stringify(convertedTranslations, null, 2));

console.log(`Converted ${Object.keys(convertedTranslations).length} translation keys to nested structure with 'en' language code.`);