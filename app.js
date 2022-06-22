const fs = require("fs");
const fileReaderService = require('./services/file-reader.service');
const pdfService = require('./services/pdf.service');

async function fillForm() {
  const outputDir = './output';
  const dataTarget = await fileReaderService.readCSVFile('./docs/data.csv');
  const pdfDoc = await pdfService.readBasePdfFile('./docs/target.pdf');
  for (const data of dataTarget) {
    const form = pdfDoc.getForm();
    const keys = Object.keys(data);
    const id = data['ID Number'] || data['ID'] || data['id'] || data['College ID'] || data['College id'] || data['college id'];
    const name = data['Name'] || data['name'];
    
    console.log(`\nprocessing id: ${id}`);
    for (const key of keys) {
      await pdfService.fillTextField(form, key, data[key]);
    }

    const pdfBytes = await pdfDoc.save();
    const fileName = `${name}-${id}.pdf`.replace(/\s+/g, '-').toLowerCase();

    fs.appendFileSync(`${outputDir}/${fileName}`, Buffer.from(pdfBytes));
  }
}

(async function() {
  await fillForm();
})();