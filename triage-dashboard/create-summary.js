const fs = require('fs');
const path = require('path');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');
const { WebClient } = require('@slack/web-api');

const argv = yargs(hideBin(process.argv))
  .option('allureDir', { type: 'string', demandOption: true })
  .option('dashboardUrl', { type: 'string', demandOption: true })
  .option('allureUrl', { type: 'string', demandOption: true })
  .argv;

// Environment variables
const SLACK_TOKEN = process.env.SLACK_TOKEN;
const CHANNEL_ID = process.env.SLACK_CHANNEL;
const EMAIL_USERNAME = process.env.EMAIL_USERNAME;
const EMAIL_PASSWORD = process.env.EMAIL_PASSWORD;
const EMAIL_RECEPIENTS = process.env.EMAIL_RECEPIENTS;
const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY;
const GITHUB_RUN_ID = process.env.GITHUB_RUN_ID;

// Paths
const summaryFile = path.join(argv.allureDir, 'widgets', 'summary.json');

if (!fs.existsSync(summaryFile)) {
  console.error(`Allure summary.json missing at ${summaryFile}`);
  process.exit(1);
}

// Read summary.json
const summaryData = JSON.parse(fs.readFileSync(summaryFile, 'utf-8'));
const totalTests = summaryData.statistic.total;
const passedTests = summaryData.statistic.passed;
const failedTests = summaryData.statistic.failed;
const brokenTests = summaryData.statistic.broken;
const skippedTests = summaryData.statistic.skipped;
const startTime = new Date(summaryData.time.start).toLocaleString('en-US', { hour12: true });
const stopTime = new Date(summaryData.time.stop).toLocaleString('en-US', { hour12: true });
const durationSec = Math.floor(summaryData.time.duration / 1000);
const hours = String(Math.floor(durationSec / 3600)).padStart(2, '0');
const minutes = String(Math.floor((durationSec % 3600) / 60)).padStart(2, '0');
const seconds = String(durationSec % 60).padStart(2, '0');
const duration = `${hours}:${minutes}:${seconds}`;

const workflowUrl = `https://github.com/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}`;

// Compose email/slack body
const emailBody = `
Hello 👋,

The automation test run for Time is complete. Here's the summary:

- Total Tests: ${totalTests}
- ✅ Passed: ${passedTests}
- ❌ Failed: ${failedTests}
- 💔 Broken: ${brokenTests}
- ⚠️ Skipped: ${skippedTests}

- Start Time: ${startTime}
- Stop Time: ${stopTime}
- Duration: ${duration}

📊 Dashboard: ${argv.dashboardUrl}
📈 Allure Report: ${argv.allureUrl}

Debug this run using the workflow link:
${workflowUrl}

Best regards,
Automation Team
`;

// Save email body to file and GitHub ENV
fs.writeFileSync('email-body.txt', emailBody);
console.log('Email body created successfully.');
console.log(emailBody);

if (SLACK_TOKEN && CHANNEL_ID) {
  const slackClient = new WebClient(SLACK_TOKEN);
  (async () => {
    try {
      await slackClient.chat.postMessage({
        channel: CHANNEL_ID,
        text: emailBody,
      });
      console.log('Message sent to Slack!');
    } catch (error) {
      console.error('Error sending Slack message:', error);
    }
  })();
}

// Set GitHub ENV variable for email body
fs.appendFileSync(process.env.GITHUB_ENV, `email_body<<EOF\n${emailBody}\nEOF\n`);
