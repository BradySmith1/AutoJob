/**
 * @version 1, April 14th, 2024
 * @author Andrew Monroe 
 * @author Brady Smith
 * 
 * This file is a script that sends an email notification to
 * a customer
 */

import EmailNotification from './emails/EmailNotification.js';
import { render } from '@react-email/render';
import ReactPDF from '@react-pdf/renderer';
import BillPDF from './pdfs/BillPDF.js';
import 'dotenv/config'
import * as fs from 'fs'
import { MongoClient, ObjectId } from 'mongodb';

//URL of mongodb server
const uri = "mongodb://localhost:27017";
//Resend api key
const apiKey = "re_JuU7fjp3_N7PywM8GkyoXWe4KVqjRKhex";
//Name of collection that contains estimate data
const estimateCollection = 'jobEstimates'

/**
 * This function finds the estimate data in the
 * database with a given id and collection
 * 
 * @param {MongoDB Database Object} db 
 * @param {string} id 
 * @param {MongoDB collection Object} collection 
 * @returns {Object} estimate data
 */
async function findDocument(db, id, collection) {
  const jobCollection = db.collection(collection);
  var estimateData;
  try{
    estimateData = await jobCollection.findOne({"_id": new ObjectId(id)});
  } catch(error){
    console.error(error);
  }
  return estimateData;
}

/**
 * Taken from Akhil Anand on Medium https://medium.com/@akhilanand.ak01/converting-streams-to-buffers-a-practical-guide-745fc2f77728
 * 
 * This function converts a stream to a buffer.
 * 
 * @param {Stream} readableStream 
 * @returns {Promise(Buffer)} pdf buffer
 */
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

/**
 * This function renders the pdf version of the itemized bill
 * 
 * @param {Object} estimateData 
 * @returns {Promise(Buffer)} pdf buffer
 */
async function renderPDFBuff(estimateData){
  const pdfStream = await ReactPDF.renderToStream(<BillPDF estimateData={estimateData} />);
  const pdfBuff = await streamToBuffer(pdfStream);
  return pdfBuff;
}

/**
 * This function sends an email to the Resend API server.
 * 
 * @param {Object} estimateData 
 */
async function sendEmail(estimateData){
  //Render email html
  const emailHtml = render(<EmailNotification estimateData={estimateData}/>);
  //Render pdf as buffer
  const pdfBuff = await renderPDFBuff(estimateData);

  //Email payload
  const payload = {
    from: 'AutoJob@eraofexpansion.net',
    to: estimateData.user.email,
    subject: 'Your Estimate Is Ready',
    html: emailHtml,
    attachments: [
      {
        filename:"estimate.pdf",
        content: pdfBuff
      }
    ]
  };

  //Request options to resend server
  const requestOptions = {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify(payload)
  };

  //Send email payload to resend server
  fetch("https://api.resend.com/emails", requestOptions)
    .then(response => response.text())
    .then(result => console.log(result))
    .catch(error => console.log('error', error));
}

/**
 * This function reads estimate data from a JSON file.
 * 
 * @param {string} path 
 * @returns {Object} estimate data
 */
function readJsonFile(path){
  console.log("Json");
  var data;
  try{
    data = fs.readFileSync(path, {encoding: 'utf8', flag: 'r'});
  } catch(error){
    console.error("ERROR: Invalid File Path or Permission Denied");
    process.exit(2);
  }
  return(JSON.parse(data));
}

/**
 * This function retrieves estimate data from the database.
 * 
 * @param {string} id, data ID
 * @param {string} uID, user ID
 * @returns {Object} estimateData
 */
async function retrieveFromDatabase(id, uID){
  console.log("Database");
  var estimateData = {};
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db(`${uID}`);
    estimateData = await findDocument(db, id, estimateCollection);
  } catch (e) {
    console.error("MongoDB Error");
    process.exit(3);
  }
  finally {
    await client.close()
  }
  return estimateData;
}

/**
 * This function chooses whether to get the estimate data
 * from a JSON file or from the database
 * 
 * @param {string[]} argv, command line args
 * @returns {Object} estimateData
 */
async function getEstimateData(argv){
  if(argv.length < 3 || argv.length > 4){
    console.error("ERROR: Invalid Command Line Args");
    process.exit(1);
  }
  var estimateData = {};
  if(argv.length === 3){
    estimateData = readJsonFile(argv[2]);
  }else if(argv.length === 4){
    estimateData = await retrieveFromDatabase(argv[2], argv[3]);
  }
  return estimateData
}

/**
 * Main driver function of the email script.
 * Gets estimate data and then sends the email.
 */
async function main(){

  const estimateData = await getEstimateData(process.argv);
  console.log(estimateData);
  sendEmail(estimateData);
}

//Call main
main();
