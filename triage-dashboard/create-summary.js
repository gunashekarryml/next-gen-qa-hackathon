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

const SLACK_TOKEN = process.env.SLACK_TOKEN;
const SLACK_CHANNEL = process.env.SLACK_CHANNEL;
const EMAIL_USERNAME = process.env.EMAIL_USERNAME;
const EMAIL_RECEPIENTS = process.env.EMAIL_RECEPIENTS;
const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY;
const GITHUB_RUN_ID = process.env.GITHUB_RUN_ID;

// --------- Read Allure summary ---------
const summaryPath = path.join(argv.allureDir, 'widgets', 'summary.json');

if (!fs.existsSync(summaryPath)) {
  console.error(`Allure summary.json missing at ${summaryPath}`);
  process.exit(1);
}

const summaryData = JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));
const totalTests = summaryData.statistic.total;
const passedTests = summaryData.statistic.passed;
const failedTests = summaryData.statistic.failed;
const brokenTests = summaryData.statistic.broken;
const skippedTests = summaryData.statistic.skipped;

const startTime = new Date(summaryData.time.start).toLocaleString();
const stopTime = new Date(summaryData.time.stop).toLocaleString();
const durationSeconds = summaryData.time.duration;

function formatDuration(sec) {
  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const seconds = sec % 60;
  return `${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`;
}

const duration = formatDuration(durationSeconds);
const workflowUrl = `https://github.com/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}`;

// --------- Compose email/slack body ---------
const emailBody = `
Hello,

The automation test run for Time is complete. Here's the summary:
- Total Tests: ${totalTests}
- ✅ Passed: ${passedTests}
- ❌ Failed: ${failedTests}
- 💔 Broken: ${brokenTests}
- ⚠️ Skipped: ${skippedTests}

- Start Time: ${startTime}
- Stop Time: ${stopTime}
- Duration: ${duration}

Full execution report:
- Dashboard: ${argv.dashboardUrl}
- Allure Report: ${argv.allureUrl}

Debug this run using the workflow link:
${workflowUrl}

Best regards,
Automation Team
`;

// --------- Save to file & GitHub ENV ---------
fs.writeFileSync('email-body.txt', emailBody);
console.log('Email body created successfully.');

fs.appendFileSync(process.env.GITHUB_ENV, `email_body<<EOF\n${emailBody}\nEOF\n`);

// --------- Send Slack Notification ---------
if (SLACK_TOKEN && SLACK_CHANNEL) {
  const slackClient = new WebClient(SLACK_TOKEN);
  slackClient.chat.postMessage({
    channel: SLACK_CHANNEL,
    text: emailBody,
  }).then(() => {
    console.log('Slack message sent successfully.');
  }).catch(err => {
    console.error('Slack message error:', err);
  });
}
