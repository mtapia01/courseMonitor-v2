const puppeteer = require("puppeteer"); // Require Puppeteer module
// const inquirer = import('inquirer');
// const fs = require("fs");
const readline = require("readline");
// const { google } = require("googleapis");
const { count } = require("console");
// const cron = require('node-cron');
const prompt = require("prompt-sync")();
const dotenv = require('dotenv');
dotenv.config()

var questions = [
  {
    courseName: 'courseName',
    courseNum: 'courseNum',
    crn: 'crn',
  },
];

questions.courseName = prompt("Course Name: ");
questions.courseNum = prompt("Course Number: ");
questions.crn = prompt("CRN: ");


// const url = "https://mystudentrecord.ucmerced.edu/pls/PROD/xhwschedule.P_ViewCrnDetail?subjcode=CRES&crsenumb=001&validterm=202230&crn=34276"; // Set website you want to screenshot
let baseURL = "https://mystudentrecord.ucmerced.edu/pls/PROD/xhwschedule.P_ViewCrnDetail?subjcode="

const courseURL = baseURL + questions.courseName + "&crsenumb=" + questions.courseNum + "&validterm=202230&crn=" + questions.crn
main();

async function main() {
  //Getting webpage elements
  var jsonClean = { courseName: "", seats: "", remaining: "" };
  const browser = await puppeteer.launch(); // Launch a "browser"
  const page = await browser.newPage(); // Open new page
  await page.goto(courseURL); // Go website
  await page.waitForSelector("body > div.pagebodydiv > table:nth-child(9)"); // Method to ensure that the element is loaded
  const tableValues = await page.evaluate(() =>
    Array.from(document.getElementsByClassName("dddefault"), (e) => e.innerText)
  );

  //parsing json to get course info
  jsonClean.courseName = tableValues[0];
  jsonClean.seats = Number.parseInt(tableValues[5]);
  jsonClean.remaining = Number.parseInt(tableValues[6]);

  await page.close(); // Close the website
  await browser.close(); // Close the browser

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  const client = require('twilio')(accountSid, authToken);

  if(jsonClean.remaining > 0){
    sendSMS(client, jsonClean.remaining, jsonClean.courseName);
  }
}

function sendSMS(client, seatsOpen, course){
    client.messages
    .create({body: 'There are ' + seatsOpen + "seats in " + course, from: '+14054508813', to: '+15595673620'})
    // .then(message => console.log(message.sid));
};
