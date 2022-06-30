const fs = require("fs");
const fileReaderService = require('./services/file-reader.service');
const pdfService = require('./services/pdf.service');
const path = require('path');

function readPath(pathRoute) {
  return path.normalize(pathRoute);
}

function readId(data) {
  const info = data['ID Number'] || data['ID'] || data['id'] || data['College ID'] || data['College id'] || data['college id'] || data['ID#'];

  return info.trim();
}

function readFirstName(data) {
  const info = data['first name'] || data['First Name'] || data['First'] || data['first'];

  return info.trim();
}

function readLastName(data) {
  const info = data['last name'] || data['Last Name'] || data['Last'] || data['last'];

  return info.trim();
}

async function fillForm() {
  const outputDir = './output';
  const dataTarget = await fileReaderService.readCSVFile('./docs/data.csv');
  const pdfDoc = await pdfService.readBasePdfFile('./docs/target.pdf');
  for (const data of dataTarget) {
    const form = pdfDoc.getForm();
    const id = readId(data);
    const firstName = readFirstName(data);
    const lastName = readLastName(data);
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

    fs.appendFileSync(readPath(`${outputDir}/${fileName}`), Buffer.from(pdfBytes));
  }
}

async function explodeFiles() {
  let startPageIndex = 0;
  const outputDir = './output';
  const dataTarget = await fileReaderService.readCSVFile('./docs/explode/data.csv');
  const pdfDoc = await pdfService.readBasePdfFile('./docs/explode/target.pdf');
  const pages = pdfDoc.getPages();

  for (const data of dataTarget) {
    const pdfDoc = await pdfService.createBlankFile();
    const targetPage = pages[startPageIndex];
    const [targetPageCopy] = await pdfDoc.copyPages(targetPage.doc, [ startPageIndex ])

    pdfDoc.addPage(targetPageCopy)

    const id = readId(data) || 'id-unknown';
    const firstName = readFirstName(data) || 'first-unknown';
    const lastName = readLastName(data) || 'last-unknown';

    const name = `${firstName} ${lastName}`;    
    console.log(`\nprocessing id: ${id} ${name}`);

    const pdfBytes = await pdfDoc.save();
    const fileName = `${lastName}, ${firstName} ${id} - CCAP Form CO26.pdf`.toLowerCase();

    fs.appendFileSync(readPath(`${outputDir}/${fileName}`), Buffer.from(pdfBytes));

    startPageIndex++;
  }
}

(async function() {
  try {
      //await fillForm();
      await explodeFiles();
  } catch (error) {
    console.log('runtime error', error.message || error);
  }
})();