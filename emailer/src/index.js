import EmailNotification from './emails/EmailNotification.js';
import { render } from '@react-email/render';
import ReactPDF from '@react-pdf/renderer';
import BillPDF from './pdfs/BillPDF.js';
import 'dotenv/config'
import * as fs from 'fs'

const uid = function(){
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
const id = uid();
const path = "/home/andrew/capstone/AutomaticJobEstimatorAndScheduler/emailer/build/temp_pdfs/";
const apiKey = "re_JuU7fjp3_N7PywM8GkyoXWe4KVqjRKhex";

if(process.argv.length !== 3){
  console.error("ERROR: Invalid Command Line Args");
  process.exit(1);
}

var data;
try{
  data = fs.readFileSync(process.argv[2], {encoding: 'utf8', flag: 'r'});
} catch(error){
  console.error("ERROR: Invalid File Path or Permission Denied");
  process.exit(2);
}
const estimateData = JSON.parse(data);


await ReactPDF.render(<BillPDF estimateData={estimateData} />, `${path}${id}.pdf`);

//const resend = new Resend(apiKey);

const fileBuffer = fs.readFileSync(`${path}${id}.pdf`);
const emailHtml = render(<EmailNotification estimateData={estimateData}/>);

const payload = {
  from: 'AutoJob@eraofexpansion.net',
  to: estimateData.user.email,
  subject: 'Your Estimate Is Ready',
  html: emailHtml,
  attachments: [
    {
      filename:"estimate.pdf",
      content: fileBuffer
    }
  ]
};

const requestOptions = {
  method: 'POST',
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${apiKey}`
  },
  body: JSON.stringify(payload)
};

fetch("https://api.resend.com/emails", requestOptions)
  .then(response => response.text())
  .then(result => console.log(result))
  .catch(error => console.log('error', error));

fs.unlink(`${path}${id}.pdf`, (err) => {
  if (err) throw err;
  console.log(`${path}${id}.pdf was deleted`);
}); 
