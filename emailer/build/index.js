import EmailNotification from './emails/EmailNotification.js';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import ReactPDF from '@react-pdf/renderer';
import BillPDF from './pdfs/BillPDF.js';
import * as fs from 'fs';
import { jsx as _jsx } from "react/jsx-runtime";
const uid = function () {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
const id = uid();
const path = "/home/andrew/capstone/AutomaticJobEstimatorAndScheduler/emailer/build/temp_pdfs/";
const RESEND_AUTH_KEY = process.env.RESEND_API_KEY;

// try {
//   fs.writeFileSync(`${__dirname}/${id}.pdf`, content);
//   // file written successfully
// } catch (err) {
//   console.error(err);
// }

// fs.writeFile(`${__dirname}/${id}.pdf`, content, err => {
//   if (err) {
//     console.error(err);
//   } else {
//     ReactPDF.render(<BillPDF />, `./${__dirname}/${id}.pdf`);

//     const resend = new Resend('re_BE3g2YQq_4QNhKhwwdWye4bpVczpYXU61');

//     resend.emails.send({
//       from: 'zaxitron298@gmail.com',
//       to: 'andrewmonroe289@gmail.com',
//       subject: 'Your Estimate Is Ready',
//       react: <EmailNotification />,
//     });
//   }
// });

ReactPDF.render( /*#__PURE__*/_jsx(BillPDF, {}), `${path}${id}.pdf`);
const fileBuffer = await fs.readFile(`${path}${id}.pdf`);

//const resend = new Resend(RESEND_AUTH_KEY);

const payload = {
  from: 'zaxitron298@gmail.com',
  to: 'andrewmonroe289@gmail.com',
  subject: 'Your Estimate Is Ready',
  react: /*#__PURE__*/_jsx(EmailNotification, {}),
  attachments: [{
    filename: "estimate.pdf",
    content: fileBuffer
  }]
};
const requestOptions = {
  method: 'POST',
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${RESEND_AUTH_KEY}`
  },
  body: JSON.stringify(payload)
};
fetch("https://api.resend.com/emails", requestOptions).then(response => response.text()).then(result => console.log(result)).catch(error => console.log('error', error));
const html = render( /*#__PURE__*/_jsx(EmailNotification, {}), {
  pretty: true
});
console.log(html);