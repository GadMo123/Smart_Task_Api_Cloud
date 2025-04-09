import AWS from "aws-sdk";
import { Task } from "../models/Task";
import { User } from "../models/User";
import { formatDate } from "../utils/awsUtils";

// AWS SES configuration is imported from AWS SDK config
const ses = new AWS.SES({ apiVersion: "2010-12-01" });

interface EmailParams {
  recipient: string;
  subject: string;
  body: string;
}

/**
 * Send an email using Amazon SES
 */
export const sendEmail = async (params: EmailParams): Promise<boolean> => {
  try {
    const sesParams = {
      Source: process.env.SES_EMAIL_FROM || "notifications@yourdomain.com",
      Destination: {
        ToAddresses: [params.recipient],
      },
      Message: {
        Subject: {
          Data: params.subject,
        },
        Body: {
          Html: {
            Data: params.body,
          },
        },
      },
    };

    await ses.sendEmail(sesParams).promise();
    console.log(`Email sent to ${params.recipient}`);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

/**
 * Send task due date reminder email
 */
export const sendTaskDueReminder = async (
  task: Task,
  user: User
): Promise<boolean> => {
  const formattedDueDate = formatDate(task.dueDate);
  const subject = `Reminder: Task "${task.title}" is due soon`;

  const body = `
    <html>
      <body>
        <h2>Task Due Reminder</h2>
        <p>Hello ${user.name},</p>
        <p>This is a friendly reminder that your task "${task.title}" is due on ${formattedDueDate}.</p>
        <p><strong>Task Details:</strong></p>
        <ul>
          <li><strong>Title:</strong> ${task.title}</li>
          <li><strong>Project:</strong> ${task.project.title}</li>
          <li><strong>Due Date:</strong> ${formattedDueDate}</li>
          <li><strong>Status:</strong> ${task.status}</li>
        </ul>
        <p>Please log in to your account to update the task status or make any necessary adjustments.</p>
        <p>Thank you,<br>Project Management System</p>
      </body>
    </html>
  `;

  return sendEmail({
    recipient: user.email,
    subject,
    body,
  });
};

/**
 * Send task assignment notification
 */
export const sendTaskAssignmentNotification = async (
  task: Task,
  assignee: User
): Promise<boolean> => {
  const formattedDueDate = task.dueDate
    ? formatDate(task.dueDate)
    : "No due date";
  const subject = `New Task Assigned: "${task.title}"`;

  const body = `
    <html>
      <body>
        <h2>New Task Assignment</h2>
        <p>Hello ${assignee.name},</p>
        <p>A new task has been assigned to you:</p>
        <p><strong>Task Details:</strong></p>
        <ul>
          <li><strong>Title:</strong> ${task.title}</li>
          <li><strong>Project:</strong> ${task.project.title}</li>
          <li><strong>Due Date:</strong> ${formattedDueDate}</li>
          <li><strong>Description:</strong> ${
            task.description || "No description provided"
          }</li>
        </ul>
        <p>Please log in to your account to view more details and update the task status.</p>
        <p>Thank you,<br>Project Management System</p>
      </body>
    </html>
  `;

  return sendEmail({
    recipient: assignee.email,
    subject,
    body,
  });
};
