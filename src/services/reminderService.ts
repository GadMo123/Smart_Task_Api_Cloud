import { getRepository } from "typeorm";
import { Task, TaskStatus } from "../models/Task";
import { ses } from "../config/aws";
import cron from "node-cron";

export const startReminderService = () => {
  // Run every day at 8:00 AM
  cron.schedule("0 8 * * *", async () => {
    try {
      console.log("Running task reminder check...");
      await checkDueTasks();
    } catch (error) {
      console.error("Error in reminder service:", error);
    }
  });
};

const checkDueTasks = async () => {
  const taskRepository = getRepository(Task);

  // Find tasks that are due today and not completed
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const dueTasks = await taskRepository.find({
    where: {
      dueDate: {
        $gte: today,
        $lt: tomorrow,
      },
      status: {
        $ne: TaskStatus.DONE,
      },
    },
    relations: ["project", "project.owner", "assignee"],
  });

  console.log(`Found ${dueTasks.length} tasks due today`);

  for (const task of dueTasks) {
    // Send email to the task owner
    await sendTaskReminder(task);
  }
};

const sendTaskReminder = async (task: Task) => {
  try {
    const recipient = task.assignee
      ? task.assignee.email
      : task.project.owner.email;
    const taskOwnerName = task.assignee
      ? task.assignee.name
      : task.project.owner.name;

    const params = {
      Source: process.env.EMAIL_FROM || "noreply@example.com",
      Destination: {
        ToAddresses: [recipient],
      },
      Message: {
        Subject: {
          Data: `Reminder: Task "${task.title}" is due today`,
        },
        Body: {
          Text: {
            Data: `Hello ${taskOwnerName},\n\nThis is a reminder that your task "${task.title}" in project "${task.project.title}" is due today.\n\nTask Status: ${task.status}\n\nPlease complete this task as soon as possible.\n\nRegards,\nTask Manager`,
          },
        },
      },
    };

    await ses.sendEmail(params).promise();
    console.log(`Reminder email sent to ${recipient} for task "${task.title}"`);
  } catch (error) {
    console.error("Error sending reminder email:", error);
  }
};
