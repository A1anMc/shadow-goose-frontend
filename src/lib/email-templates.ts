import { logger } from './logger';

// Email Templates for Grant Applications
// Professional email templates for various grant application scenarios

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
}

export interface EmailData {
  to: string;
  template: string;
  variables: Record<string, string | number>;
  attachments?: Array<{
    filename: string;
    content: string;
    contentType: string;
  }>;
}

class EmailTemplateService {
  private templates: Map<string, EmailTemplate> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  private initializeTemplates() {
    // Application Started Template
    this.templates.set('application_started', {
      id: 'application_started',
      name: 'Grant Application Started',
      subject: 'Your grant application for {{grant_name}} has been started',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; text-align: center;">
            <h1 style="color: #2c3e50; margin: 0;">Grant Application Started</h1>
          </div>
          
          <div style="padding: 20px;">
            <p>Hello {{user_name}},</p>
            
            <p>Great news! You've started your grant application for <strong>{{grant_name}}</strong>.</p>
            
            <div style="background-color: #e8f4fd; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #2c3e50;">Application Details</h3>
              <p><strong>Grant:</strong> {{grant_name}}</p>
              <p><strong>Amount:</strong> {{grant_amount}}</p>
              <p><strong>Deadline:</strong> {{deadline}}</p>
              <p><strong>Category:</strong> {{grant_category}}</p>
            </div>
            
            <p>Your application is currently saved as a draft. You can continue working on it anytime by clicking the link below:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{application_url}}" style="background-color: #3498db; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Continue Application</a>
            </div>
            
            <p><strong>Next Steps:</strong></p>
            <ul>
              <li>Complete all required sections</li>
              <li>Review your application thoroughly</li>
              <li>Use our AI writing assistant for guidance</li>
              <li>Submit before the deadline</li>
            </ul>
            
            <p>We'll send you reminders as the deadline approaches to help you stay on track.</p>
            
            <p>Best regards,<br>
            The SGE Team</p>
          </div>
        </div>
      `,
      variables: ['user_name', 'grant_name', 'grant_amount', 'deadline', 'grant_category', 'application_url']
    });

    // Deadline Reminder Template
    this.templates.set('deadline_reminder', {
      id: 'deadline_reminder',
      name: 'Deadline Reminder',
      subject: 'URGENT: Your grant application for {{grant_name}} is due in {{days_left}} days',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #fff3cd; padding: 20px; text-align: center; border-left: 4px solid #ffc107;">
            <h1 style="color: #856404; margin: 0;">⚠️ Deadline Reminder</h1>
          </div>
          
          <div style="padding: 20px;">
            <p>Hello {{user_name}},</p>
            
            <p><strong>Important:</strong> Your grant application for <strong>{{grant_name}}</strong> is due in <strong>{{days_left}} day{{days_left_plural}}</strong>!</p>
            
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #ffc107;">
              <h3 style="margin-top: 0; color: #856404;">Application Status</h3>
              <p><strong>Grant:</strong> {{grant_name}}</p>
              <p><strong>Deadline:</strong> {{deadline}}</p>
              <p><strong>Completion:</strong> {{completion_percentage}}%</p>
              <p><strong>Status:</strong> {{application_status}}</p>
            </div>
            
            <p>Don't miss this opportunity! Click the button below to complete your application:</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{application_url}}" style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Complete Application Now</a>
            </div>
            
            <p><strong>Quick Tips:</strong></p>
            <ul>
              <li>Review all sections for completeness</li>
              <li>Use our AI writing assistant for final polish</li>
              <li>Double-check all requirements</li>
              <li>Submit early to avoid technical issues</li>
            </ul>
            
            <p>If you need any assistance, our support team is here to help!</p>
            
            <p>Best regards,<br>
            The SGE Team</p>
          </div>
        </div>
      `,
      variables: ['user_name', 'grant_name', 'days_left', 'days_left_plural', 'deadline', 'completion_percentage', 'application_status', 'application_url']
    });

    // Application Submitted Template
    this.templates.set('application_submitted', {
      id: 'application_submitted',
      name: 'Application Submitted',
      subject: 'Your grant application for {{grant_name}} has been submitted successfully',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #d4edda; padding: 20px; text-align: center; border-left: 4px solid #28a745;">
            <h1 style="color: #155724; margin: 0;">✅ Application Submitted</h1>
          </div>
          
          <div style="padding: 20px;">
            <p>Hello {{user_name}},</p>
            
            <p>Congratulations! Your grant application for <strong>{{grant_name}}</strong> has been submitted successfully.</p>
            
            <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745;">
              <h3 style="margin-top: 0; color: #155724;">Submission Details</h3>
              <p><strong>Grant:</strong> {{grant_name}}</p>
              <p><strong>Application ID:</strong> {{application_id}}</p>
              <p><strong>Submitted:</strong> {{submission_date}}</p>
              <p><strong>Amount Requested:</strong> {{grant_amount}}</p>
            </div>
            
            <p>Your application is now under review. We'll notify you as soon as we receive any updates from the grant provider.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{application_url}}" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">View Application</a>
            </div>
            
            <p><strong>What happens next?</strong></p>
            <ul>
              <li>Your application will be reviewed by the grant provider</li>
              <li>You may be contacted for additional information</li>
              <li>We'll notify you of the final decision</li>
              <li>If approved, you'll receive funding details</li>
            </ul>
            
            <p>Thank you for using SGE for your grant application!</p>
            
            <p>Best regards,<br>
            The SGE Team</p>
          </div>
        </div>
      `,
      variables: ['user_name', 'grant_name', 'application_id', 'submission_date', 'grant_amount', 'application_url']
    });

    // Application Approved Template
    this.templates.set('application_approved', {
      id: 'application_approved',
      name: 'Application Approved',
      subject: '🎉 CONGRATULATIONS! Your grant application for {{grant_name}} has been approved!',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #d4edda; padding: 20px; text-align: center; border-left: 4px solid #28a745;">
            <h1 style="color: #155724; margin: 0;">🎉 CONGRATULATIONS!</h1>
            <h2 style="color: #155724; margin: 10px 0;">Your Grant Application Has Been Approved!</h2>
          </div>
          
          <div style="padding: 20px;">
            <p>Hello {{user_name}},</p>
            
            <p>We're thrilled to announce that your grant application for <strong>{{grant_name}}</strong> has been <strong>APPROVED</strong>! 🎉</p>
            
            <div style="background-color: #d4edda; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745;">
              <h3 style="margin-top: 0; color: #155724;">Approval Details</h3>
              <p><strong>Grant:</strong> {{grant_name}}</p>
              <p><strong>Approved Amount:</strong> {{approved_amount}}</p>
              <p><strong>Application ID:</strong> {{application_id}}</p>
              <p><strong>Approval Date:</strong> {{approval_date}}</p>
            </div>
            
            <p>This is a fantastic achievement! Your hard work and dedication have paid off.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{application_url}}" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">View Approval Details</a>
            </div>
            
            <p><strong>Next Steps:</strong></p>
            <ul>
              <li>Review the approval letter and terms</li>
              <li>Complete any required documentation</li>
              <li>Set up funding disbursement</li>
              <li>Begin implementing your project</li>
            </ul>
            
            <p>We'll be in touch soon with detailed instructions for receiving your funding.</p>
            
            <p>Congratulations again on this wonderful success!</p>
            
            <p>Best regards,<br>
            The SGE Team</p>
          </div>
        </div>
      `,
      variables: ['user_name', 'grant_name', 'approved_amount', 'application_id', 'approval_date', 'application_url']
    });

    // Application Rejected Template
    this.templates.set('application_rejected', {
      id: 'application_rejected',
      name: 'Application Rejected',
      subject: 'Update on your grant application for {{grant_name}}',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8d7da; padding: 20px; text-align: center; border-left: 4px solid #dc3545;">
            <h1 style="color: #721c24; margin: 0;">Application Update</h1>
          </div>
          
          <div style="padding: 20px;">
            <p>Hello {{user_name}},</p>
            
            <p>We wanted to inform you about the status of your grant application for <strong>{{grant_name}}</strong>.</p>
            
            <div style="background-color: #f8d7da; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #dc3545;">
              <h3 style="margin-top: 0; color: #721c24;">Application Status</h3>
              <p><strong>Grant:</strong> {{grant_name}}</p>
              <p><strong>Status:</strong> Not approved at this time</p>
              <p><strong>Application ID:</strong> {{application_id}}</p>
              <p><strong>Decision Date:</strong> {{decision_date}}</p>
            </div>
            
            <p>While this application wasn't successful, please don't be discouraged. Grant applications are highly competitive, and many factors can influence the decision.</p>
            
            <p><strong>What you can do next:</strong></p>
            <ul>
              <li>Review the feedback provided (if available)</li>
              <li>Consider applying for other grants</li>
              <li>Strengthen your application for future opportunities</li>
              <li>Use our AI writing assistant to improve your next application</li>
            </ul>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{grants_url}}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">Find More Grants</a>
            </div>
            
            <p>We're here to support you in your grant-seeking journey. Don't hesitate to reach out if you need assistance with future applications.</p>
            
            <p>Best regards,<br>
            The SGE Team</p>
          </div>
        </div>
      `,
      variables: ['user_name', 'grant_name', 'application_id', 'decision_date', 'grants_url']
    });

    // Weekly Summary Template
    this.templates.set('weekly_summary', {
      id: 'weekly_summary',
      name: 'Weekly Summary',
      subject: 'Your weekly grant application summary - {{week_period}}',
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #e9ecef; padding: 20px; text-align: center;">
            <h1 style="color: #495057; margin: 0;">Weekly Grant Summary</h1>
            <p style="color: #6c757d; margin: 5px 0;">{{week_period}}</p>
          </div>
          
          <div style="padding: 20px;">
            <p>Hello {{user_name}},</p>
            
            <p>Here's your weekly summary of grant application activity:</p>
            
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #495057;">This Week's Activity</h3>
              <p><strong>Applications Started:</strong> {{applications_started}}</p>
              <p><strong>Applications Submitted:</strong> {{applications_submitted}}</p>
              <p><strong>Applications Approved:</strong> {{applications_approved}}</p>
              <p><strong>Total Funding Secured:</strong> {{total_funding}}</p>
            </div>
            
            <div style="background-color: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #856404;">Upcoming Deadlines</h3>
              {{upcoming_deadlines}}
            </div>
            
            <div style="background-color: #d1ecf1; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #0c5460;">Recommendations</h3>
              <ul>
                <li>Complete any draft applications</li>
                <li>Start new applications for upcoming deadlines</li>
                <li>Review and improve existing applications</li>
                <li>Use our AI writing assistant for better results</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{dashboard_url}}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">View Full Dashboard</a>
            </div>
            
            <p>Keep up the great work! We're here to support your grant-seeking success.</p>
            
            <p>Best regards,<br>
            The SGE Team</p>
          </div>
        </div>
      `,
      variables: ['user_name', 'week_period', 'applications_started', 'applications_submitted', 'applications_approved', 'total_funding', 'upcoming_deadlines', 'dashboard_url']
    });
  }

  // Get template by ID
  getTemplate(templateId: string): EmailTemplate | undefined {
    return this.templates.get(templateId);
  }

  // Get all templates
  getAllTemplates(): EmailTemplate[] {
    return Array.from(this.templates.values());
  }

  // Render template with variables
  renderTemplate(templateId: string, variables: Record<string, string | number>): { subject: string; body: string } | null {
    const template = this.getTemplate(templateId);
    if (!template) return null;

    let subject = template.subject;
    let body = template.body;

    // Replace variables in subject and body
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      subject = subject.replace(new RegExp(placeholder, 'g'), String(value));
      body = body.replace(new RegExp(placeholder, 'g'), String(value));
    });

    return { subject, body };
  }

  // Send email (placeholder for actual email service integration)
  async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      const template = this.getTemplate(emailData.template);
      if (!template) {
        throw new Error(`Template ${emailData.template} not found`);
      }

      const rendered = this.renderTemplate(emailData.template, emailData.variables);
      if (!rendered) {
        throw new Error('Failed to render email template');
      }

      // Here you would integrate with your email service (SendGrid, AWS SES, etc.)
      logger.info('Sending email:', {
        to: emailData.to,
        subject: rendered.subject,
        body: rendered.body,
        attachments: emailData.attachments
      });

      // Placeholder for actual email sending
      // await emailService.send({
      //   to: emailData.to,
      //   subject: rendered.subject,
      //   html: rendered.body,
      //   attachments: emailData.attachments
      // });

      return true;
    } catch (error) {
      logger.error('Error sending email:', error);
      return false;
    }
  }

  // Create deadline reminder email
  createDeadlineReminderEmail(userEmail: string, userData: any, applicationData: any, grantData: any): EmailData {
    const daysLeft = Math.ceil((new Date(grantData.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      to: userEmail,
      template: 'deadline_reminder',
      variables: {
        user_name: userData.name,
        grant_name: grantData.name,
        days_left: daysLeft,
        days_left_plural: daysLeft === 1 ? '' : 's',
        deadline: new Date(grantData.deadline).toLocaleDateString('en-AU'),
        completion_percentage: applicationData.completion_percentage || 0,
        application_status: applicationData.status,
        application_url: `${window.location.origin}/grants/applications/${applicationData.id}`
      }
    };
  }

  // Create application status update email
  createStatusUpdateEmail(userEmail: string, userData: any, applicationData: any, grantData: any, newStatus: string): EmailData {
    const templateMap: Record<string, string> = {
      'submitted': 'application_submitted',
      'approved': 'application_approved',
      'rejected': 'application_rejected'
    };

    const template = templateMap[newStatus];
    if (!template) {
      throw new Error(`No email template for status: ${newStatus}`);
    }

    const baseVariables = {
      user_name: userData.name,
      grant_name: grantData.name,
      application_id: applicationData.id,
      application_url: `${window.location.origin}/grants/applications/${applicationData.id}`
    };

    const statusSpecificVariables: Record<string, any> = {};

    switch (newStatus) {
      case 'submitted':
        statusSpecificVariables.submission_date = new Date().toLocaleDateString('en-AU');
        statusSpecificVariables.grant_amount = new Intl.NumberFormat('en-AU', {
          style: 'currency',
          currency: 'AUD'
        }).format(grantData.amount);
        break;
      case 'approved':
        statusSpecificVariables.approved_amount = new Intl.NumberFormat('en-AU', {
          style: 'currency',
          currency: 'AUD'
        }).format(grantData.amount);
        statusSpecificVariables.approval_date = new Date().toLocaleDateString('en-AU');
        break;
      case 'rejected':
        statusSpecificVariables.decision_date = new Date().toLocaleDateString('en-AU');
        statusSpecificVariables.grants_url = `${window.location.origin}/grants`;
        break;
    }

    return {
      to: userEmail,
      template,
      variables: { ...baseVariables, ...statusSpecificVariables }
    };
  }

  // Create weekly summary email
  createWeeklySummaryEmail(userEmail: string, userData: any, summaryData: any): EmailData {
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);
    const weekEnd = new Date();
    
    const weekPeriod = `${weekStart.toLocaleDateString('en-AU')} - ${weekEnd.toLocaleDateString('en-AU')}`;

    return {
      to: userEmail,
      template: 'weekly_summary',
      variables: {
        user_name: userData.name,
        week_period: weekPeriod,
        applications_started: summaryData.applications_started || 0,
        applications_submitted: summaryData.applications_submitted || 0,
        applications_approved: summaryData.applications_approved || 0,
        total_funding: new Intl.NumberFormat('en-AU', {
          style: 'currency',
          currency: 'AUD'
        }).format(summaryData.total_funding || 0),
        upcoming_deadlines: summaryData.upcoming_deadlines || 'No upcoming deadlines',
        dashboard_url: `${window.location.origin}/grants/applications/dashboard`
      }
    };
  }
}

export const emailTemplateService = new EmailTemplateService();
