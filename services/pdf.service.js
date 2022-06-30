const pdfLib = require("pdf-lib");
const fs = require("fs");

module.exports = {
  readBasePdfFile,
  fillTextField,
  createBlankFile,
}

function createBlankFile() {
  return pdfLib.PDFDocument.create();
}

function readBasePdfFile(filename) {
  const formPdfBytes = fs.readFileSync(filename);

  return pdfLib.PDFDocument.load(formPdfBytes);
}

function fillTextField(pdfFormIntance, target, data) {
  try {
    const nameField = pdfFormIntance.getTextField(target);

    nameField.setText(data);
  } catch (error) {
    console.log('fill text field error: ', error.message || error);
  }
}