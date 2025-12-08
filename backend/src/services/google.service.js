const { google } = require('googleapis');

class GoogleService {
    /**
     * Create OAuth2 client with user's tokens
     */
    getOAuth2Client(user) {
        const oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_CALLBACK_URL
        );

        oauth2Client.setCredentials({
            access_token: user.google_access_token,
            refresh_token: user.google_refresh_token
        });

        // Handle token refresh
        oauth2Client.on('tokens', async (tokens) => {
            if (tokens.access_token) {
                user.google_access_token = tokens.access_token;
                await user.save();
            }
        });

        return oauth2Client;
    }

    // =====================
    // GOOGLE SHEETS
    // =====================

    /**
     * Create a new Google Sheet for meeting data
     */
    async createSpreadsheet(user, title) {
        const auth = this.getOAuth2Client(user);
        const sheets = google.sheets({ version: 'v4', auth });

        try {
            const response = await sheets.spreadsheets.create({
                resource: {
                    properties: { title },
                    sheets: [
                        {
                            properties: {
                                title: 'Meeting Summary',
                                gridProperties: { rowCount: 100, columnCount: 10 }
                            }
                        },
                        {
                            properties: {
                                title: 'Action Items',
                                gridProperties: { rowCount: 100, columnCount: 6 }
                            }
                        },
                        {
                            properties: {
                                title: 'Deadlines',
                                gridProperties: { rowCount: 100, columnCount: 5 }
                            }
                        }
                    ]
                }
            });

            return response.data;
        } catch (error) {
            console.error('Create Spreadsheet Error:', error);
            throw new Error(`Failed to create spreadsheet: ${error.message}`);
        }
    }

    /**
     * Write meeting data to a spreadsheet
     */
    async writeMeetingToSheet(user, spreadsheetId, meetingData) {
        const auth = this.getOAuth2Client(user);
        const sheets = google.sheets({ version: 'v4', auth });

        try {
            // Write summary
            await sheets.spreadsheets.values.update({
                spreadsheetId,
                range: 'Meeting Summary!A1:B10',
                valueInputOption: 'RAW',
                resource: {
                    values: [
                        ['Title', meetingData.title || 'Untitled Meeting'],
                        ['Date', new Date().toLocaleDateString()],
                        ['Summary', meetingData.summary || ''],
                        ['Participants', (meetingData.actors || []).map(a => a.name).join(', ')],
                        ['Status', meetingData.status || 'COMPLETED']
                    ]
                }
            });

            // Write action items
            const actionItems = (meetingData.responsibilities || []).map((r, i) => [
                i + 1,
                r.actor,
                r.task,
                r.priority,
                r.status
            ]);

            if (actionItems.length > 0) {
                await sheets.spreadsheets.values.update({
                    spreadsheetId,
                    range: 'Action Items!A1:E100',
                    valueInputOption: 'RAW',
                    resource: {
                        values: [
                            ['#', 'Assigned To', 'Task', 'Priority', 'Status'],
                            ...actionItems
                        ]
                    }
                });
            }

            // Write deadlines
            const deadlines = (meetingData.deadlines || []).map((d, i) => [
                i + 1,
                d.actor,
                d.task,
                d.deadline || 'TBD'
            ]);

            if (deadlines.length > 0) {
                await sheets.spreadsheets.values.update({
                    spreadsheetId,
                    range: 'Deadlines!A1:D100',
                    valueInputOption: 'RAW',
                    resource: {
                        values: [
                            ['#', 'Assigned To', 'Task', 'Deadline'],
                            ...deadlines
                        ]
                    }
                });
            }

            return { success: true, spreadsheetId };
        } catch (error) {
            console.error('Write to Sheet Error:', error);
            throw new Error(`Failed to write to spreadsheet: ${error.message}`);
        }
    }

    /**
     * Add a single row to an existing sheet
     */
    async appendRow(user, spreadsheetId, sheetName, values) {
        const auth = this.getOAuth2Client(user);
        const sheets = google.sheets({ version: 'v4', auth });

        try {
            const response = await sheets.spreadsheets.values.append({
                spreadsheetId,
                range: `${sheetName}!A:Z`,
                valueInputOption: 'RAW',
                insertDataOption: 'INSERT_ROWS',
                resource: { values: [values] }
            });

            return response.data;
        } catch (error) {
            console.error('Append Row Error:', error);
            throw new Error(`Failed to append row: ${error.message}`);
        }
    }

    // =====================
    // GOOGLE CALENDAR
    // =====================

    /**
     * Create a calendar event for a deadline
     */
    async createCalendarEvent(user, eventData) {
        const auth = this.getOAuth2Client(user);
        const calendar = google.calendar({ version: 'v3', auth });

        try {
            const event = {
                summary: eventData.title,
                description: eventData.description || '',
                start: {
                    dateTime: new Date(eventData.startTime).toISOString(),
                    timeZone: eventData.timeZone || 'UTC'
                },
                end: {
                    dateTime: new Date(eventData.endTime).toISOString(),
                    timeZone: eventData.timeZone || 'UTC'
                },
                reminders: {
                    useDefault: false,
                    overrides: [
                        { method: 'email', minutes: 24 * 60 }, // 1 day before
                        { method: 'popup', minutes: 60 }       // 1 hour before
                    ]
                }
            };

            // Add attendees if provided
            if (eventData.attendees && eventData.attendees.length > 0) {
                event.attendees = eventData.attendees.map(email => ({ email }));
            }

            // Add location if provided
            if (eventData.location) {
                event.location = eventData.location;
            }

            const response = await calendar.events.insert({
                calendarId: eventData.calendarId || 'primary',
                resource: event,
                sendUpdates: 'all'
            });

            return response.data;
        } catch (error) {
            console.error('Create Calendar Event Error:', error);
            throw new Error(`Failed to create calendar event: ${error.message}`);
        }
    }

    /**
     * Create deadline events from meeting data
     */
    async createDeadlineEvents(user, meetingId, deadlines) {
        const createdEvents = [];

        for (const deadline of deadlines) {
            if (!deadline.deadline) continue;

            try {
                const deadlineDate = new Date(deadline.deadline);

                // Set event to 9 AM on the deadline date
                deadlineDate.setHours(9, 0, 0, 0);

                const endTime = new Date(deadlineDate);
                endTime.setHours(10, 0, 0, 0);

                const event = await this.createCalendarEvent(user, {
                    title: `📋 Deadline: ${deadline.task}`,
                    description: `Meeting ID: ${meetingId}\nAssigned to: ${deadline.actor}\n\nThis deadline was automatically created from a meeting transcript.`,
                    startTime: deadlineDate,
                    endTime: endTime
                });

                createdEvents.push({
                    task: deadline.task,
                    eventId: event.id,
                    eventLink: event.htmlLink
                });
            } catch (error) {
                console.error(`Failed to create event for deadline: ${deadline.task}`, error);
            }
        }

        return createdEvents;
    }

    /**
     * List user's calendar events
     */
    async listCalendarEvents(user, options = {}) {
        const auth = this.getOAuth2Client(user);
        const calendar = google.calendar({ version: 'v3', auth });

        try {
            const response = await calendar.events.list({
                calendarId: options.calendarId || 'primary',
                timeMin: options.timeMin || new Date().toISOString(),
                maxResults: options.maxResults || 50,
                singleEvents: true,
                orderBy: 'startTime'
            });

            return response.data.items || [];
        } catch (error) {
            console.error('List Calendar Events Error:', error);
            throw new Error(`Failed to list calendar events: ${error.message}`);
        }
    }

    /**
     * Delete a calendar event
     */
    async deleteCalendarEvent(user, eventId, calendarId = 'primary') {
        const auth = this.getOAuth2Client(user);
        const calendar = google.calendar({ version: 'v3', auth });

        try {
            await calendar.events.delete({
                calendarId,
                eventId
            });
            return { success: true };
        } catch (error) {
            console.error('Delete Calendar Event Error:', error);
            throw new Error(`Failed to delete calendar event: ${error.message}`);
        }
    }

    /**
     * Update a calendar event
     */
    async updateCalendarEvent(user, eventId, updates, calendarId = 'primary') {
        const auth = this.getOAuth2Client(user);
        const calendar = google.calendar({ version: 'v3', auth });

        try {
            const response = await calendar.events.patch({
                calendarId,
                eventId,
                resource: updates
            });

            return response.data;
        } catch (error) {
            console.error('Update Calendar Event Error:', error);
            throw new Error(`Failed to update calendar event: ${error.message}`);
        }
    }
}

module.exports = new GoogleService();
