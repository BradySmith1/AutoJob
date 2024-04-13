import EmailNotification from './emails/EmailNotification.js';
import { render } from '@react-email/render';
import ReactPDF from '@react-pdf/renderer';
import BillPDF from './pdfs/BillPDF.js';
import 'dotenv/config';
import * as fs from 'fs';
import { jsx as _jsx } from "react/jsx-runtime";
const apiKey = "re_JuU7fjp3_N7PywM8GkyoXWe4KVqjRKhex";

//Taken from Akhil Anand on Medium https://medium.com/@akhilanand.ak01/converting-streams-to-buffers-a-practical-guide-745fc2f77728
async function streamToBuffer(readableStream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    readableStream.on('data', data => {
      if (typeof data === 'string') {
        // Convert string to Buffer assuming UTF-8 encoding
        chunks.push(Buffer.from(data, 'utf-8'));
      } else if (data instanceof Buffer) {
        chunks.push(data);
      } else {
        // Convert other data types to JSON and then to a Buffer
        const jsonData = JSON.stringify(data);
        chunks.push(Buffer.from(jsonData, 'utf-8'));
      }
    });
    readableStream.on('end', () => {
      resolve(Buffer.concat(chunks));
    });
    readableStream.on('error', reject);
  });
}
async function renderPDFBuff(estimateData) {
  const pdfStream = await ReactPDF.renderToStream( /*#__PURE__*/_jsx(BillPDF, {
    estimateData: estimateData
  }));
  const pdfBuff = await streamToBuffer(pdfStream);
  return pdfBuff;
}
async function sendEmail(estimateData) {
  const emailHtml = render( /*#__PURE__*/_jsx(EmailNotification, {
    estimateData: estimateData
  }));
  const pdfBuff = await renderPDFBuff(estimateData);
  const payload = {
    from: 'AutoJob@eraofexpansion.net',
    to: estimateData.user.email,
    subject: 'Your Estimate Is Ready',
    html: emailHtml,
    attachments: [{
      filename: "estimate.pdf",
      content: pdfBuff
    }]
  };
  const requestOptions = {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload)
  };
  fetch("https://api.resend.com/emails", requestOptions).then(response => response.text()).then(result => console.log(result)).catch(error => console.log('error', error));
}
function readJsonFile(path) {
  var data;
  try {
    data = fs.readFileSync(path, {
      encoding: 'utf8',
      flag: 'r'
    });
  } catch (error) {
    console.error("ERROR: Invalid File Path or Permission Denied");
    process.exit(2);
  }
  return JSON.parse(data);
}
async function main() {
  if (process.argv.length !== 3) {
    console.error("ERROR: Invalid Command Line Args");
    process.exit(1);
  }
  const estimateData = readJsonFile(process.argv[2]);
  sendEmail(estimateData);
}
main();