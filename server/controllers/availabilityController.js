const ProviderAvailability = require('../models/ProviderAvailability');
const Provider = require('../models/Provider');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const mongoose = require('mongoose');

const normalizeTo24Hr = (timeStr) => {
    if (!timeStr) return null;
    if (typeof timeStr === 'string' && timeStr.includes(':')) {
        if (timeStr.includes('AM') || timeStr.includes('PM')) {
            const parts = timeStr.trim().split(' ');
            const [time, period] = parts;
            let [h, m] = time.split(':').map(Number);
            if (period === 'PM' && h !== 12) h += 12;
            if (period === 'AM' && h === 12) h = 0;
            return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
        }
        return timeStr;
    }
    return timeStr;
};

const toUTCMidnight = (dateInput) => {
    if (!dateInput) return null;
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return null;
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
};

const formatMinutesToUI = (totalMinutes) => {
    const hours24 = Math.floor(totalMinutes / 60) % 24;
    const minutes = totalMinutes % 60;
    const period = hours24 >= 12 ? 'PM' : 'AM';
    const hours12 = hours24 > 12 ? hours24 - 12 : hours24 === 0 ? 12 : hours24;
    return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
};

const parseToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const normalized = normalizeTo24Hr(timeStr);
    const [h, m] = normalized.split(':').map(Number);
    return h * 60 + (m || 0);
};

const generateServiceSlots = (startHour, endHour, duration, bufferTime) => {
    const slots = [];
    const startMinutes = (startHour || 9) * 60;
    const endMinutes = (endHour || 18) * 60;
    const gap = (duration || 60) + (bufferTime || 15);
    let current = startMinutes;
    while (current + (duration || 60) <= endMinutes) {
        slots.push({
            start: formatMinutesToUI(current),
            end: formatMinutesToUI(current + (duration || 60))
        });
        current += gap;
    }
    return slots;
};

const getProviderAvailabilityInternal = async (providerId, date, serviceId) => {
    if (!serviceId) return { error: 'Service ID required' };
    
    const requestedDate = new Date(date);
    const dayOfWeek = requestedDate.getDay(); 
    const utcMidnight = toUTCMidnight(requestedDate);

    const records = await ProviderAvailability.find({
        provider: providerId,
        service: serviceId,
        $or: [
            { specificDate: utcMidnight },
            { isDefaultSchedule: true }
        ]
    });

    const specificDateOverride = records.find(o => o.specificDate && isSameDate(o.specificDate, utcMidnight));
    const masterSchedule = records.find(o => o.isDefaultSchedule);

    function isSameDate(d1, d2) {
        return d1.toISOString().split('T')[0] === d2.toISOString().split('T')[0];
    }

    let isAvailable = true;
    let reason = '';
    let startHour = 9, endHour = 18;

    if (specificDateOverride) {
        isAvailable = specificDateOverride.isAvailable;
        startHour = specificDateOverride.startHour;
        endHour = specificDateOverride.endHour;
        if (!isAvailable) reason = 'Blocked for this service';
    } else if (masterSchedule) {
        const workingDays = masterSchedule.workingDays || [1,2,3,4,5];
        if (!workingDays.includes(dayOfWeek)) {
            isAvailable = false;
            reason = 'Closed today';
        }
        startHour = masterSchedule.startHour;
        endHour = masterSchedule.endHour;
    } else {
        isAvailable = false;
        reason = 'No active schedule';
    }

    const utcStart = new Date(utcMidnight);
    const utcEnd = new Date(utcMidnight); utcEnd.setUTCHours(23, 59, 59, 999);

    return { isAvailable, reason, startHour, endHour, dateStart: utcStart, dateEnd: utcEnd };
};

const getAvailableSlots = async (req, res) => {
    const { providerId, serviceId, date } = req.params;
    try {
        const { isAvailable, reason, startHour, endHour, dateStart, dateEnd } = await getProviderAvailabilityInternal(providerId, date, serviceId);
        if (!isAvailable) return res.json({ available: false, slots: [], message: reason });
        
        const service = await Service.findById(serviceId);
        const duration = service?.duration || 60;
        const bufferTime = service?.bufferTime || 15;
        
        const allPossibleSlots = generateServiceSlots(startHour, endHour, duration, bufferTime);
        const bookedAppointments = await Booking.find({
            provider: providerId,
            service: serviceId,
            date: { $gte: dateStart, $lte: dateEnd },
            status: { $nin: ['Rejected', 'Cancelled'] }
        });
        
        const existingWindows = bookedAppointments.map(b => ({
            start: parseToMinutes(b.appointmentStartTime),
            end: parseToMinutes(b.appointmentEndTime)
        }));
        
        const availableSlots = allPossibleSlots.filter(newSlot => {
            const nStart = parseToMinutes(newSlot.start);
            const nEnd = parseToMinutes(newSlot.end);
            return !existingWindows.some(ext => (nStart < ext.end && nEnd > ext.start));
        });

        res.json({
            available: true,
            slots: allPossibleSlots.map(s => s.start),
            availableSlots: availableSlots.map(s => s.start),
            workingHours: { startHour, endHour }
        });
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const getMonthAvailability = async (req, res) => {
    const { providerId, serviceId, month } = req.params;
    try {
        const [year, mNum] = month.split('-').map(Number);
        const start = new Date(Date.UTC(year, mNum - 1, 1));
        const end = new Date(Date.UTC(year, mNum, 0, 23, 59, 59, 999));
        
        const results = [];
        const todayStr = toUTCMidnight(new Date()).toISOString().split('T')[0];

        for (let d = 1; d <= end.getUTCDate(); d++) {
            const date = new Date(Date.UTC(year, mNum - 1, d));
            const dateStr = date.toISOString().split('T')[0];
            
            if (dateStr < todayStr) {
                results.push({ date: dateStr, status: 'past' });
                continue;
            }

            const resData = await getProviderAvailabilityInternal(providerId, date, serviceId);
            results.push({ date: dateStr, status: resData.isAvailable ? 'available' : 'unavailable' });
        }
        res.json(results);
    } catch (error) { res.status(500).json({ message: error.message }); }
};

const getProviderSchedule = async (req, res) => {
    const { serviceId } = req.query;
    if (!serviceId) return res.status(400).json({ message: 'serviceId required' });
    try {
        const overrides = await ProviderAvailability.find({ 
            provider: req.user._id, 
            service: serviceId 
        });
        const master = overrides.find(o => o.isDefaultSchedule);
        res.json({ 
            masterSchedule: master || { workingDays: [1,2,3,4,5], startHour: 9, endHour: 18 }, 
            overrides: overrides.filter(o => !o.isDefaultSchedule) 
        });
    } catch (error) {
        console.error("GET schedule error", error);
        res.status(500).json({ message: error.message }); 
    }
};

const updateProviderSchedule = async (req, res) => {
    const { serviceId, workingDays, startHour, endHour } = req.body;
    if (!serviceId) return res.status(400).json({ message: 'serviceId required' });
    try {
        const updated = await ProviderAvailability.findOneAndUpdate(
            { provider: req.user._id, service: serviceId, isDefaultSchedule: true },
            { $set: { workingDays, startHour, endHour, isAvailable: true } },
            { upsert: true, returnDocument: 'after' }
        );
        res.json({ message: 'Saved', updated });
    } catch (error) { 
        console.error("PUT schedule error", error);
        res.status(500).json({ message: error.message }); 
    }
};

const blockAvailability = async (req, res) => {
    const { specificDate, isAvailable, startHour, endHour, serviceId } = req.body;
    if (!serviceId) return res.status(400).json({ message: 'serviceId required' });
    try {
        const updated = await ProviderAvailability.findOneAndUpdate(
            { provider: req.user._id, service: serviceId, specificDate: toUTCMidnight(specificDate), isDefaultSchedule: false },
            { $set: { isAvailable, startHour, endHour } },
            { upsert: true, returnDocument: 'after' }
        );
        res.json({ message: 'Override Saved', updated });
    } catch (error) {
        console.error("POST block error", error);
        res.status(500).json({ message: error.message }); 
    }
};

module.exports = {
    getAvailableSlots,
    getMonthAvailability,
    getProviderSchedule,
    updateProviderSchedule,
    blockAvailability,
    toUTCMidnight,
    getProviderAvailabilityInternal,
    parseToMinutes
};
