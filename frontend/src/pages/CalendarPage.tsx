import { useState, useEffect, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, startOfMonth, endOfMonth, addMonths, subMonths } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Plus, ChevronLeft, ChevronRight, X, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 0 }),
    getDay,
    locales,
});

interface CalendarEvent {
    _id: string;
    title: string;
    description: string;
    start_time: string;
    end_time: string;
    all_day: boolean;
    type: string;
    color: string;
    meeting_id?: string;
}

interface FormattedEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    allDay: boolean;
    resource: CalendarEvent;
}

const API_URL = 'http://localhost:5000/api';

const eventColors: Record<string, string> = {
    deadline: '#f59e0b',
    reminder: '#3b82f6',
    meeting: '#8b5cf6',
    custom: '#d97706',
};

export default function CalendarPage() {
    const [events, setEvents] = useState<FormattedEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<typeof Views[keyof typeof Views]>(Views.MONTH);
    const [showModal, setShowModal] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        start_time: '',
        end_time: '',
        all_day: false,
        type: 'custom',
        color: '#d97706'
    });

    const fetchEvents = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const start = startOfMonth(subMonths(currentDate, 1)).toISOString();
            const end = endOfMonth(addMonths(currentDate, 1)).toISOString();

            const res = await fetch(`${API_URL}/calendar/events?start=${start}&end=${end}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                const formatted = data.events.map((event: CalendarEvent) => ({
                    id: event._id,
                    title: event.title,
                    start: new Date(event.start_time),
                    end: new Date(event.end_time),
                    allDay: event.all_day,
                    resource: event
                }));
                setEvents(formatted);
            }
        } catch (error) {
            console.error('Failed to fetch events:', error);
        } finally {
            setLoading(false);
        }
    }, [currentDate]);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
        setSelectedEvent(null);
        setFormData({
            title: '',
            description: '',
            start_time: format(start, "yyyy-MM-dd'T'HH:mm"),
            end_time: format(end, "yyyy-MM-dd'T'HH:mm"),
            all_day: false,
            type: 'custom',
            color: '#d97706'
        });
        setShowModal(true);
    };

    const handleSelectEvent = (event: FormattedEvent) => {
        const e = event.resource;
        setSelectedEvent(e);
        setFormData({
            title: e.title,
            description: e.description,
            start_time: format(new Date(e.start_time), "yyyy-MM-dd'T'HH:mm"),
            end_time: format(new Date(e.end_time), "yyyy-MM-dd'T'HH:mm"),
            all_day: e.all_day,
            type: e.type,
            color: e.color
        });
        setShowModal(true);
    };

    const handleSubmit = async () => {
        if (!formData.title || !formData.start_time || !formData.end_time) return;

        try {
            const token = localStorage.getItem('token');
            const url = selectedEvent
                ? `${API_URL}/calendar/events/${selectedEvent._id}`
                : `${API_URL}/calendar/events`;

            const res = await fetch(url, {
                method: selectedEvent ? 'PUT' : 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setShowModal(false);
                fetchEvents();
            }
        } catch (error) {
            console.error('Failed to save event:', error);
        }
    };

    const handleDelete = async () => {
        if (!selectedEvent || !confirm('Delete this event?')) return;

        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/calendar/events/${selectedEvent._id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                setShowModal(false);
                fetchEvents();
            }
        } catch (error) {
            console.error('Failed to delete event:', error);
        }
    };

    const eventStyleGetter = (event: FormattedEvent) => {
        const color = event.resource.color || eventColors[event.resource.type] || '#d97706';
        return {
            style: {
                backgroundColor: color,
                borderRadius: '4px',
                opacity: 0.9,
                color: 'white',
                border: 'none',
                fontSize: '12px'
            }
        };
    };

    const CustomToolbar = ({ onNavigate, label }: { onNavigate: (action: 'PREV' | 'NEXT' | 'TODAY') => void; label: string }) => (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 0', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button onClick={() => onNavigate('PREV')} className="btn-secondary" style={{ width: 'auto', padding: '8px 12px' }}>
                    <ChevronLeft size={18} />
                </button>
                <button onClick={() => onNavigate('TODAY')} className="btn-secondary" style={{ width: 'auto', padding: '8px 16px' }}>
                    Today
                </button>
                <button onClick={() => onNavigate('NEXT')} className="btn-secondary" style={{ width: 'auto', padding: '8px 12px' }}>
                    <ChevronRight size={18} />
                </button>
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'white', margin: 0 }}>{label}</h2>
            <div style={{ display: 'flex', gap: '8px' }}>
                {['month', 'week', 'day'].map((v) => (
                    <button
                        key={v}
                        onClick={() => setView(v as typeof Views[keyof typeof Views])}
                        className={view === v ? 'btn-primary' : 'btn-secondary'}
                        style={{ width: 'auto', padding: '8px 16px', textTransform: 'capitalize' }}
                    >
                        {v}
                    </button>
                ))}
            </div>
        </div>
    );

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Loader2 size={32} className="animate-spin" style={{ color: '#d97706' }} />
            </div>
        );
    }

    return (
        <div style={{ padding: '32px 40px', height: 'calc(100vh - 64px)' }} className="animate-fadeIn">
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '28px', fontWeight: '600', color: 'white', margin: 0 }}>Calendar</h1>
                    <p style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)', margin: 0, marginTop: '4px' }}>
                        Manage deadlines and events
                    </p>
                </div>
                <button
                    onClick={() => handleSelectSlot({ start: new Date(), end: new Date(Date.now() + 3600000) })}
                    className="btn-primary"
                    style={{ width: 'auto', padding: '12px 20px' }}
                >
                    <Plus size={18} style={{ marginRight: '8px' }} />
                    New Event
                </button>
            </div>

            {/* Calendar */}
            <div className="dashboard-card" style={{ padding: '20px', height: 'calc(100% - 100px)' }}>
                <style>{`
          .rbc-calendar { background: transparent; color: white; }
          .rbc-header { color: rgba(255,255,255,0.6); padding: 12px 4px; border-bottom: 1px solid rgba(255,255,255,0.1); font-weight: 500; }
          .rbc-today { background: rgba(217, 119, 6, 0.1) !important; }
          .rbc-off-range-bg { background: rgba(0,0,0,0.2); }
          .rbc-month-view, .rbc-time-view { border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; }
          .rbc-day-bg + .rbc-day-bg { border-left: 1px solid rgba(255,255,255,0.05); }
          .rbc-month-row + .rbc-month-row { border-top: 1px solid rgba(255,255,255,0.05); }
          .rbc-date-cell { padding: 8px; color: rgba(255,255,255,0.7); }
          .rbc-date-cell.rbc-now { font-weight: bold; color: #fbbf24; }
          .rbc-event { padding: 2px 6px; }
          .rbc-event:focus { outline: 2px solid #fbbf24; }
          .rbc-time-header, .rbc-time-content { border-color: rgba(255,255,255,0.1); }
          .rbc-timeslot-group { border-color: rgba(255,255,255,0.05); }
          .rbc-time-slot { color: rgba(255,255,255,0.4); }
          .rbc-current-time-indicator { background: #d97706; }
          .rbc-toolbar { display: none; }
        `}</style>
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: '100%' }}
                    view={view}
                    onView={(v) => setView(v)}
                    date={currentDate}
                    onNavigate={setCurrentDate}
                    selectable
                    onSelectSlot={handleSelectSlot}
                    onSelectEvent={handleSelectEvent}
                    eventPropGetter={eventStyleGetter}
                    components={{ toolbar: CustomToolbar }}
                />
            </div>

            {/* Event Modal */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                    <div className="dashboard-card" style={{ width: '100%', maxWidth: '480px', padding: '24px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'white', margin: 0 }}>
                                {selectedEvent ? 'Edit Event' : 'New Event'}
                            </h3>
                            <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '6px' }}>Title</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="glass-input"
                                    placeholder="Event title"
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '6px' }}>Description</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="glass-input"
                                    placeholder="Event description"
                                    rows={3}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '6px' }}>Start</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.start_time}
                                        onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                        className="glass-input"
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '6px' }}>End</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.end_time}
                                        onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                                        className="glass-input"
                                    />
                                </div>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <input
                                    type="checkbox"
                                    id="allDay"
                                    checked={formData.all_day}
                                    onChange={(e) => setFormData({ ...formData, all_day: e.target.checked })}
                                    style={{ width: '16px', height: '16px', accentColor: '#d97706' }}
                                />
                                <label htmlFor="allDay" style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)' }}>All day event</label>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '6px' }}>Type</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value, color: eventColors[e.target.value] || '#d97706' })}
                                    className="glass-input"
                                >
                                    <option value="custom">Custom</option>
                                    <option value="deadline">Deadline</option>
                                    <option value="reminder">Reminder</option>
                                    <option value="meeting">Meeting</option>
                                </select>
                            </div>

                            <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                                <button onClick={handleSubmit} className="btn-primary" style={{ flex: 1 }}>
                                    <CalendarIcon size={16} style={{ marginRight: '8px' }} />
                                    {selectedEvent ? 'Update' : 'Create'}
                                </button>
                                {selectedEvent && (
                                    <button onClick={handleDelete} className="btn-secondary" style={{ width: 'auto', padding: '0 16px', color: '#f87171' }}>
                                        Delete
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
