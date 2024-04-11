import EmailNotification from './emails/EmailNotification.js';
import { Resend } from 'resend'
import { render } from '@react-email/render';
import ReactPDF from '@react-pdf/renderer';
import BillPDF from './pdfs/BillPDF.js';
import * as fs from 'fs';

const uid = function(){
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}
const id = uid();
const path = "/home/andrew/capstone/AutomaticJobEstimatorAndScheduler/emailer/build/temp_pdfs/"
const content = ' ';
const apiKey = process.env.RESEND_API_KEY;

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

ReactPDF.render(<BillPDF />, `${path}${id}.pdf`);

    const resend = new Resend(apiKey);

    resend.emails.send({
      from: 'zaxitron298@gmail.com',
      to: 'andrewmonroe289@gmail.com',
      subject: 'Your Estimate Is Ready',
      react: <EmailNotification />,
      attachments: [
        {
          "filename":"estimate.pdf",
          "path":`${path}${id}.pdf`
    
        }
      ]
    });

const html = render(<EmailNotification />, {
  pretty: true,
});

console.log(html);
