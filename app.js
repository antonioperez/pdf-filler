const fs = require("fs");
const fileReaderService = require('./services/file-reader.service');
const pdfService = require('./services/pdf.service');

async function fillForm() {
  const outputDir = './output';
  const dataTarget = await fileReaderService.readCSVFile('./docs/data.csv');
  const pdfDoc = await pdfService.readBasePdfFile('./docs/target.pdf');
  for (const data of dataTarget) {
    const form = pdfDoc.getForm();
    const id = data['ID Number'] || data['ID'] || data['id'] || data['College ID'] || data['College id'] || data['college id'];
    const firstName = data['first name'] || data['First Name'];
    const lastName = data['last name'] || data['Last Name'];
    const skippedKeys = ['last name', 'first name'];
    const name = `${firstName} ${lastName}`;
    data['Name'] = name;
    
    const keys = Object.keys(data);
    console.log(`\nprocessing id: ${id}`);
    for (const key of keys) {
      if (skippedKeys.includes(key.toLowerCase())) {
        continue;
      }

      await pdfService.fillTextField(form, key, data[key]);
    }

    const pdfBytes = await pdfDoc.save();
    const fileName = `${id}-${name}.pdf`.replace(/\s+/g, '-').toLowerCase();

    fs.appendFileSync(`${outputDir}/${fileName}`, Buffer.from(pdfBytes));
  }
}

(async function() {
  await fillForm();
})();